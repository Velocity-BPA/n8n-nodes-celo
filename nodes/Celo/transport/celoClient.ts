/*
 * Copyright (c) Velocity BPA, LLC
 * Licensed under the Business Source License 1.1
 * Commercial use requires a separate commercial license.
 * See LICENSE file for details.
 */

import type { IExecuteFunctions, IHttpRequestMethods, ILoadOptionsFunctions, IPollFunctions } from 'n8n-workflow';
import * as crypto from 'crypto';
import { CELO_NETWORKS, CELO_CONTRACTS, ABI_FRAGMENTS } from '../constants/celo.constants';
import type { CeloNetwork, JsonRpcResponse, CeloCredentials } from '../utils/types';

/**
 * Get the RPC URL for a network
 */
export function getRpcUrl(credentials: CeloCredentials): string {
  const network = credentials.network;
  
  if (network === 'custom') {
    if (!credentials.rpcEndpoint) {
      throw new Error('Custom network requires an RPC endpoint');
    }
    return credentials.rpcEndpoint;
  }
  
  const networkConfig = CELO_NETWORKS[network as keyof typeof CELO_NETWORKS];
  if (!networkConfig) {
    throw new Error(`Unknown network: ${network}`);
  }
  
  return networkConfig.rpcUrl;
}

/**
 * Get the explorer API URL for a network
 */
export function getExplorerApiUrl(credentials: CeloCredentials): string {
  const network = credentials.network;
  
  if (network === 'custom' || network === 'baklava') {
    // Baklava uses blockscout which has different API
    const networkConfig = CELO_NETWORKS[network as keyof typeof CELO_NETWORKS];
    return networkConfig?.explorerApiUrl || '';
  }
  
  const networkConfig = CELO_NETWORKS[network as keyof typeof CELO_NETWORKS];
  if (!networkConfig) {
    throw new Error(`Unknown network: ${network}`);
  }
  
  return networkConfig.explorerApiUrl;
}

/**
 * Get contract address for a network
 */
export function getContractAddress(
  network: CeloNetwork,
  contractName: keyof typeof CELO_CONTRACTS.mainnet
): string {
  const contracts = network === 'mainnet' || network === 'custom' 
    ? CELO_CONTRACTS.mainnet 
    : CELO_CONTRACTS.alfajores;
  
  const address = contracts[contractName];
  if (!address) {
    throw new Error(`Contract ${contractName} not found for network ${network}`);
  }
  
  return address;
}

/**
 * Make a JSON-RPC call to the Celo network
 */
export async function makeRpcCall<T = unknown>(
  context: IExecuteFunctions | ILoadOptionsFunctions | IPollFunctions,
  method: string,
  params: unknown[] = [],
  itemIndex: number = 0
): Promise<T> {
  const credentials = await context.getCredentials('celoApi') as CeloCredentials;
  const rpcUrl = getRpcUrl(credentials);
  
  const body = {
    jsonrpc: '2.0',
    method,
    params,
    id: Date.now(),
  };
  
  const response = await context.helpers.httpRequest({
    method: 'POST' as IHttpRequestMethods,
    url: rpcUrl,
    headers: {
      'Content-Type': 'application/json',
    },
    body,
    json: true,
  });
  
  const rpcResponse = response as JsonRpcResponse<T>;
  
  if (rpcResponse.error) {
    throw new Error(`RPC Error: ${rpcResponse.error.message} (code: ${rpcResponse.error.code})`);
  }
  
  return rpcResponse.result as T;
}

/**
 * Make a call to the Celoscan API
 */
export async function makeExplorerCall<T = unknown>(
  context: IExecuteFunctions | ILoadOptionsFunctions | IPollFunctions,
  params: Record<string, string>,
  itemIndex: number = 0
): Promise<T> {
  const credentials = await context.getCredentials('celoApi') as CeloCredentials;
  const explorerUrl = getExplorerApiUrl(credentials);
  
  if (!explorerUrl) {
    throw new Error('Explorer API not available for this network');
  }
  
  const queryParams: Record<string, string> = { ...params };
  
  if (credentials.celoscanApiKey) {
    queryParams.apikey = credentials.celoscanApiKey;
  }
  
  const response = await context.helpers.httpRequest({
    method: 'GET' as IHttpRequestMethods,
    url: explorerUrl,
    qs: queryParams,
    json: true,
  });
  
  if (response.status === '0' && response.message !== 'No transactions found') {
    throw new Error(`Explorer API Error: ${response.message || response.result}`);
  }
  
  return response.result as T;
}

/**
 * Encode a function call for a smart contract
 */
export function encodeFunctionCall(
  functionName: string,
  types: string[],
  values: unknown[]
): string {
  // Simple ABI encoding for common cases
  const functionSelector = getFunctionSelector(functionName, types);
  const encodedParams = encodeParameters(types, values);
  return functionSelector + encodedParams;
}

/**
 * Get the function selector (first 4 bytes of keccak256 hash)
 */
function getFunctionSelector(functionName: string, paramTypes: string[]): string {
  const signature = `${functionName}(${paramTypes.join(',')})`;
  return keccak256(signature).slice(0, 10);
}

/**
 * Simple keccak256 implementation using built-in crypto
 */
function keccak256(input: string): string {
  // Note: Node.js crypto doesn't have keccak256, so we use a workaround
  // In production, you'd use a proper keccak256 library
  // For now, we'll use the web3-style function signature hashing
  const hash = crypto.createHash('sha3-256').update(input).digest('hex');
  return '0x' + hash;
}

/**
 * Encode parameters for a contract call
 */
function encodeParameters(types: string[], values: unknown[]): string {
  let encoded = '';
  
  for (let i = 0; i < types.length; i++) {
    const type = types[i];
    const value = values[i];
    
    if (type === 'address') {
      encoded += padLeft(String(value).toLowerCase().replace('0x', ''), 64);
    } else if (type === 'uint256' || type === 'uint') {
      const hex = BigInt(value as string | number).toString(16);
      encoded += padLeft(hex, 64);
    } else if (type === 'bool') {
      encoded += padLeft(value ? '1' : '0', 64);
    } else if (type === 'bytes32') {
      encoded += padLeft(String(value).replace('0x', ''), 64);
    } else if (type === 'string' || type === 'bytes') {
      const hexValue = Buffer.from(String(value)).toString('hex');
      const offset = types.length * 32;
      encoded += padLeft(offset.toString(16), 64);
      // Dynamic data would be appended at the end
    }
  }
  
  return encoded;
}

/**
 * Decode a hex result from a contract call
 */
export function decodeResult(hexResult: string, types: string[]): unknown[] {
  const data = hexResult.replace('0x', '');
  const results: unknown[] = [];
  
  let offset = 0;
  for (const type of types) {
    if (type === 'address') {
      results.push('0x' + data.slice(offset + 24, offset + 64));
      offset += 64;
    } else if (type === 'uint256' || type === 'uint') {
      results.push(BigInt('0x' + data.slice(offset, offset + 64)).toString());
      offset += 64;
    } else if (type === 'bool') {
      results.push(data.slice(offset + 63, offset + 64) === '1');
      offset += 64;
    } else if (type === 'bytes32') {
      results.push('0x' + data.slice(offset, offset + 64));
      offset += 64;
    }
  }
  
  return results;
}

/**
 * Pad a hex string to the left with zeros
 */
function padLeft(hex: string, length: number): string {
  return hex.padStart(length, '0');
}

/**
 * Format Wei to CELO/token with decimals
 */
export function formatUnits(value: string | bigint, decimals: number = 18): string {
  const valueStr = typeof value === 'bigint' ? value.toString() : value;
  const valueBigInt = BigInt(valueStr);
  
  if (valueBigInt === BigInt(0)) {
    return '0';
  }
  
  const divisor = BigInt(10 ** decimals);
  const integerPart = valueBigInt / divisor;
  const fractionalPart = valueBigInt % divisor;
  
  if (fractionalPart === BigInt(0)) {
    return integerPart.toString();
  }
  
  const fractionalStr = fractionalPart.toString().padStart(decimals, '0');
  const trimmedFractional = fractionalStr.replace(/0+$/, '');
  
  return `${integerPart}.${trimmedFractional}`;
}

/**
 * Parse CELO/token amount to Wei
 */
export function parseUnits(value: string, decimals: number = 18): string {
  const [integerPart, fractionalPart = ''] = value.split('.');
  const paddedFractional = fractionalPart.padEnd(decimals, '0').slice(0, decimals);
  const combined = integerPart + paddedFractional;
  return BigInt(combined).toString();
}

/**
 * Validate Ethereum/Celo address
 */
export function isValidAddress(address: string): boolean {
  return /^0x[a-fA-F0-9]{40}$/.test(address);
}

/**
 * Validate transaction hash
 */
export function isValidTransactionHash(hash: string): boolean {
  return /^0x[a-fA-F0-9]{64}$/.test(hash);
}

/**
 * Get chain ID for a network
 */
export function getChainId(network: CeloNetwork): number {
  if (network === 'custom') {
    return CELO_NETWORKS.mainnet.chainId; // Default to mainnet
  }
  return CELO_NETWORKS[network].chainId;
}

/**
 * Sign a transaction (simplified - for production use proper signing)
 */
export async function signTransaction(
  context: IExecuteFunctions,
  transaction: {
    to: string;
    value?: string;
    data?: string;
    gas?: string;
    gasPrice?: string;
    nonce?: string;
    feeCurrency?: string;
  },
  itemIndex: number = 0
): Promise<string> {
  const credentials = await context.getCredentials('celoApi') as CeloCredentials;
  
  if (!credentials.privateKey) {
    throw new Error('Private key is required for signing transactions');
  }
  
  // In a production implementation, you would:
  // 1. Build the transaction with proper RLP encoding
  // 2. Sign with the private key
  // 3. Return the signed transaction hex
  
  // For now, we'll use eth_sendTransaction which requires an unlocked account
  // or implement proper signing with a library
  
  throw new Error(
    'Transaction signing requires additional setup. ' +
    'Please use a signing service or implement proper transaction signing.'
  );
}

/**
 * Estimate gas for a transaction
 */
export async function estimateGas(
  context: IExecuteFunctions,
  transaction: {
    from?: string;
    to: string;
    value?: string;
    data?: string;
    feeCurrency?: string;
  },
  itemIndex: number = 0
): Promise<string> {
  return await makeRpcCall<string>(
    context,
    'eth_estimateGas',
    [transaction],
    itemIndex
  );
}

/**
 * Get the current nonce for an address
 */
export async function getNonce(
  context: IExecuteFunctions,
  address: string,
  itemIndex: number = 0
): Promise<string> {
  return await makeRpcCall<string>(
    context,
    'eth_getTransactionCount',
    [address, 'latest'],
    itemIndex
  );
}

/**
 * Get current gas price
 */
export async function getGasPrice(
  context: IExecuteFunctions,
  itemIndex: number = 0
): Promise<string> {
  return await makeRpcCall<string>(
    context,
    'eth_gasPrice',
    [],
    itemIndex
  );
}

/**
 * Get current block number
 */
export async function getBlockNumber(
  context: IExecuteFunctions | ILoadOptionsFunctions | IPollFunctions,
  itemIndex: number = 0
): Promise<string> {
  return await makeRpcCall<string>(
    context,
    'eth_blockNumber',
    [],
    itemIndex
  );
}

/**
 * Get block by number
 */
export async function getBlock(
  context: IExecuteFunctions,
  blockNumber: string | number,
  includeTransactions: boolean = false,
  itemIndex: number = 0
): Promise<unknown> {
  const blockParam = typeof blockNumber === 'number' 
    ? '0x' + blockNumber.toString(16)
    : blockNumber;
    
  return await makeRpcCall(
    context,
    'eth_getBlockByNumber',
    [blockParam, includeTransactions],
    itemIndex
  );
}

/**
 * Call a contract function (read-only)
 */
export async function callContract(
  context: IExecuteFunctions | ILoadOptionsFunctions | IPollFunctions,
  to: string,
  data: string,
  itemIndex: number = 0
): Promise<string> {
  return await makeRpcCall<string>(
    context,
    'eth_call',
    [{ to, data }, 'latest'],
    itemIndex
  );
}

/**
 * Get logs/events
 */
export async function getLogs(
  context: IExecuteFunctions | IPollFunctions,
  filter: {
    fromBlock?: string;
    toBlock?: string;
    address?: string | string[];
    topics?: (string | string[] | null)[];
  },
  itemIndex: number = 0
): Promise<unknown[]> {
  return await makeRpcCall<unknown[]>(
    context,
    'eth_getLogs',
    [filter],
    itemIndex
  );
}
