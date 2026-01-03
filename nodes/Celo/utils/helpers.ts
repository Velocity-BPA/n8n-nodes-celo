/*
 * Copyright (c) Velocity BPA, LLC
 * Licensed under the Business Source License 1.1
 * Commercial use requires a separate commercial license.
 * See LICENSE file for details.
 */

import * as crypto from 'crypto';
import { STABLECOINS, FEE_CURRENCIES, CELO_CONTRACTS } from '../constants/celo.constants';
import type { CeloNetwork, StablecoinSymbol, FeeCurrencyOption, UnitConversion, HashedIdentifier } from './types';

/**
 * Hash a phone number identifier for ODIS lookup
 * Note: This is a simplified version. Full ODIS integration requires
 * oblivious decryption with the ODIS service.
 */
export function hashPhoneNumber(phoneNumber: string, pepper?: string): HashedIdentifier {
  // Normalize phone number
  const normalized = normalizePhoneNumber(phoneNumber);
  
  // Create hash (simplified - real implementation uses ODIS)
  const data = pepper ? `${normalized}${pepper}` : normalized;
  const hash = crypto.createHash('sha256').update(data).digest('hex');
  
  return {
    original: phoneNumber,
    hash: '0x' + hash,
    pepper,
  };
}

/**
 * Normalize a phone number to E.164 format
 */
export function normalizePhoneNumber(phoneNumber: string): string {
  // Remove all non-numeric characters except leading +
  let normalized = phoneNumber.replace(/[^\d+]/g, '');
  
  // Ensure it starts with +
  if (!normalized.startsWith('+')) {
    // Assume US number if no country code
    if (normalized.length === 10) {
      normalized = '+1' + normalized;
    } else {
      normalized = '+' + normalized;
    }
  }
  
  return normalized;
}

/**
 * Get stablecoin contract address
 */
export function getStablecoinAddress(symbol: StablecoinSymbol, network: CeloNetwork): string {
  const stablecoin = STABLECOINS[symbol];
  if (!stablecoin) {
    throw new Error(`Unknown stablecoin: ${symbol}`);
  }
  
  const addressKey = network === 'mainnet' || network === 'custom' ? 'mainnet' : 'alfajores';
  return stablecoin[addressKey];
}

/**
 * Get all fee currency options for a network
 */
export function getFeeCurrencyOptions(network: CeloNetwork): FeeCurrencyOption[] {
  const currencies = network === 'mainnet' || network === 'custom'
    ? FEE_CURRENCIES.mainnet
    : FEE_CURRENCIES.alfajores;
    
  return [
    { symbol: 'CELO', address: null, name: 'Celo Native Token' },
    { symbol: 'cUSD', address: currencies.cUSD, name: 'Celo Dollar' },
    { symbol: 'cEUR', address: currencies.cEUR, name: 'Celo Euro' },
    { symbol: 'cREAL', address: currencies.cREAL, name: 'Celo Brazilian Real' },
  ];
}

/**
 * Convert between Wei and CELO/Gwei
 */
export function convertUnits(value: string, fromUnit: 'wei' | 'gwei' | 'celo'): UnitConversion {
  const valueBigInt = BigInt(value.split('.')[0]); // Remove decimals for BigInt
  
  let weiValue: bigint;
  
  switch (fromUnit) {
    case 'wei':
      weiValue = valueBigInt;
      break;
    case 'gwei':
      weiValue = valueBigInt * BigInt(10 ** 9);
      break;
    case 'celo':
      weiValue = valueBigInt * BigInt(10 ** 18);
      break;
    default:
      throw new Error(`Unknown unit: ${fromUnit}`);
  }
  
  return {
    wei: weiValue.toString(),
    gwei: (weiValue / BigInt(10 ** 9)).toString(),
    celo: formatBigIntWithDecimals(weiValue, 18),
  };
}

/**
 * Format a BigInt with decimal places
 */
function formatBigIntWithDecimals(value: bigint, decimals: number): string {
  const divisor = BigInt(10 ** decimals);
  const integerPart = value / divisor;
  const fractionalPart = value % divisor;
  
  if (fractionalPart === BigInt(0)) {
    return integerPart.toString();
  }
  
  const fractionalStr = fractionalPart.toString().padStart(decimals, '0');
  const trimmedFractional = fractionalStr.replace(/0+$/, '');
  
  return `${integerPart}.${trimmedFractional}`;
}

/**
 * Parse a token amount to its smallest unit
 */
export function parseTokenAmount(amount: string, decimals: number = 18): string {
  const [integerPart, fractionalPart = ''] = amount.split('.');
  const paddedFractional = fractionalPart.padEnd(decimals, '0').slice(0, decimals);
  const combined = integerPart + paddedFractional;
  
  // Remove leading zeros but keep at least one digit
  return combined.replace(/^0+/, '') || '0';
}

/**
 * Format a token amount from its smallest unit
 */
export function formatTokenAmount(value: string, decimals: number = 18): string {
  if (value === '0' || value === '') {
    return '0';
  }
  
  const paddedValue = value.padStart(decimals + 1, '0');
  const integerPart = paddedValue.slice(0, -decimals) || '0';
  const fractionalPart = paddedValue.slice(-decimals);
  const trimmedFractional = fractionalPart.replace(/0+$/, '');
  
  if (trimmedFractional === '') {
    return integerPart;
  }
  
  return `${integerPart}.${trimmedFractional}`;
}

/**
 * Calculate percentage
 */
export function calculatePercentage(part: string, total: string): string {
  if (total === '0') return '0';
  
  const partBigInt = BigInt(part);
  const totalBigInt = BigInt(total);
  
  // Calculate with 4 decimal places of precision
  const percentage = (partBigInt * BigInt(10000)) / totalBigInt;
  const percentageNum = Number(percentage) / 100;
  
  return percentageNum.toFixed(2);
}

/**
 * Validate and format an address
 */
export function formatAddress(address: string): string {
  if (!/^0x[a-fA-F0-9]{40}$/.test(address)) {
    throw new Error(`Invalid address format: ${address}`);
  }
  return address.toLowerCase();
}

/**
 * Truncate address for display
 */
export function truncateAddress(address: string, chars: number = 6): string {
  return `${address.slice(0, chars + 2)}...${address.slice(-chars)}`;
}

/**
 * Get the exchange contract address for a stablecoin
 */
export function getExchangeAddress(symbol: StablecoinSymbol, network: CeloNetwork): string {
  const contracts = network === 'mainnet' || network === 'custom'
    ? CELO_CONTRACTS.mainnet
    : CELO_CONTRACTS.alfajores;
    
  switch (symbol) {
    case 'cUSD':
      return contracts.Exchange;
    case 'cEUR':
      return contracts.ExchangeEUR;
    case 'cREAL':
      return contracts.ExchangeBRL;
    default:
      throw new Error(`Unknown stablecoin for exchange: ${symbol}`);
  }
}

/**
 * Calculate epoch number from block number
 * Celo epochs are approximately 17,280 blocks (1 day)
 */
export function calculateEpochFromBlock(blockNumber: string | number): number {
  const block = typeof blockNumber === 'string' 
    ? parseInt(blockNumber, blockNumber.startsWith('0x') ? 16 : 10)
    : blockNumber;
    
  const epochSize = 17280; // Approximate blocks per epoch
  return Math.floor(block / epochSize);
}

/**
 * Get epoch boundaries
 */
export function getEpochBoundaries(epochNumber: number): { firstBlock: number; lastBlock: number } {
  const epochSize = 17280;
  return {
    firstBlock: epochNumber * epochSize,
    lastBlock: (epochNumber + 1) * epochSize - 1,
  };
}

/**
 * Create a function selector from function signature
 */
export function createFunctionSelector(signature: string): string {
  const hash = crypto.createHash('sha3-256').update(signature).digest('hex');
  return '0x' + hash.slice(0, 8);
}

/**
 * Encode function data for common operations
 */
export function encodeFunctionData(functionName: string, params: unknown[]): string {
  // Common function signatures
  const signatures: Record<string, { sig: string; types: string[] }> = {
    balanceOf: { sig: 'balanceOf(address)', types: ['address'] },
    transfer: { sig: 'transfer(address,uint256)', types: ['address', 'uint256'] },
    approve: { sig: 'approve(address,uint256)', types: ['address', 'uint256'] },
    allowance: { sig: 'allowance(address,address)', types: ['address', 'address'] },
    totalSupply: { sig: 'totalSupply()', types: [] },
    decimals: { sig: 'decimals()', types: [] },
    name: { sig: 'name()', types: [] },
    symbol: { sig: 'symbol()', types: [] },
  };
  
  const funcInfo = signatures[functionName];
  if (!funcInfo) {
    throw new Error(`Unknown function: ${functionName}`);
  }
  
  const selector = createFunctionSelector(funcInfo.sig);
  
  if (funcInfo.types.length === 0) {
    return selector;
  }
  
  let encodedParams = '';
  for (let i = 0; i < funcInfo.types.length; i++) {
    const type = funcInfo.types[i];
    const value = params[i];
    
    if (type === 'address') {
      encodedParams += String(value).toLowerCase().replace('0x', '').padStart(64, '0');
    } else if (type === 'uint256') {
      const hex = BigInt(value as string | number).toString(16);
      encodedParams += hex.padStart(64, '0');
    }
  }
  
  return selector + encodedParams;
}

/**
 * Decode a hex string result
 */
export function decodeHexString(hex: string): string {
  const cleanHex = hex.replace('0x', '');
  
  // Handle dynamic string encoding
  if (cleanHex.length > 128) {
    // Skip offset (32 bytes) and length (32 bytes)
    const lengthHex = cleanHex.slice(64, 128);
    const length = parseInt(lengthHex, 16) * 2; // Convert to hex char count
    const dataHex = cleanHex.slice(128, 128 + length);
    return Buffer.from(dataHex, 'hex').toString('utf8');
  }
  
  return Buffer.from(cleanHex, 'hex').toString('utf8').replace(/\0/g, '');
}

/**
 * Decode a uint256 from hex
 */
export function decodeUint256(hex: string): string {
  const cleanHex = hex.replace('0x', '');
  return BigInt('0x' + cleanHex).toString();
}

/**
 * Decode an address from hex
 */
export function decodeAddress(hex: string): string {
  const cleanHex = hex.replace('0x', '');
  // Address is in the last 40 characters of a 64-char hex (32 bytes)
  return '0x' + cleanHex.slice(-40).toLowerCase();
}

/**
 * Decode a boolean from hex
 */
export function decodeBool(hex: string): boolean {
  const cleanHex = hex.replace('0x', '');
  return cleanHex.slice(-1) === '1';
}

/**
 * Sleep utility for polling
 */
export function sleep(ms: number): Promise<void> {
  return new Promise(resolve => setTimeout(resolve, ms));
}

/**
 * Retry with exponential backoff
 */
export async function retryWithBackoff<T>(
  fn: () => Promise<T>,
  maxRetries: number = 3,
  baseDelay: number = 1000
): Promise<T> {
  let lastError: Error | undefined;
  
  for (let i = 0; i < maxRetries; i++) {
    try {
      return await fn();
    } catch (error) {
      lastError = error as Error;
      if (i < maxRetries - 1) {
        await sleep(baseDelay * Math.pow(2, i));
      }
    }
  }
  
  throw lastError;
}

/**
 * Check if a value is a valid hex string
 */
export function isHex(value: string): boolean {
  return /^0x[a-fA-F0-9]*$/.test(value);
}

/**
 * Convert a number to hex
 */
export function toHex(value: number | string | bigint): string {
  if (typeof value === 'string' && value.startsWith('0x')) {
    return value;
  }
  return '0x' + BigInt(value).toString(16);
}

/**
 * Convert hex to number
 */
export function fromHex(hex: string): bigint {
  return BigInt(hex);
}
