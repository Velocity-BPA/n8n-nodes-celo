/*
 * Copyright (c) Velocity BPA, LLC
 * Licensed under the Business Source License 1.1
 * Commercial use requires a separate commercial license.
 * See LICENSE file for details.
 */

/**
 * Network types
 */
export type CeloNetwork = 'mainnet' | 'alfajores' | 'baklava' | 'custom';

/**
 * Stablecoin types
 */
export type StablecoinSymbol = 'cUSD' | 'cEUR' | 'cREAL';

/**
 * Vote value for governance
 */
export type VoteValue = 'None' | 'Abstain' | 'No' | 'Yes';

/**
 * JSON-RPC request structure
 */
export interface JsonRpcRequest {
  jsonrpc: '2.0';
  method: string;
  params: unknown[];
  id: number;
}

/**
 * JSON-RPC response structure
 */
export interface JsonRpcResponse<T = unknown> {
  jsonrpc: '2.0';
  id: number;
  result?: T;
  error?: {
    code: number;
    message: string;
    data?: unknown;
  };
}

/**
 * Credential structure
 */
export interface CeloCredentials {
  network: CeloNetwork;
  rpcEndpoint?: string;
  privateKey?: string;
  celoscanApiKey?: string;
}

/**
 * Balance response
 */
export interface BalanceResponse {
  address: string;
  balance: string;
  balanceFormatted: string;
  symbol: string;
  network: string;
}

/**
 * All balances response
 */
export interface AllBalancesResponse {
  address: string;
  network: string;
  balances: {
    CELO: string;
    cUSD: string;
    cEUR: string;
    cREAL: string;
  };
  balancesFormatted: {
    CELO: string;
    cUSD: string;
    cEUR: string;
    cREAL: string;
  };
}

/**
 * Transaction data
 */
export interface TransactionData {
  hash: string;
  blockNumber: string | null;
  blockHash: string | null;
  from: string;
  to: string | null;
  value: string;
  valueFormatted: string;
  gas: string;
  gasPrice: string;
  input: string;
  nonce: string;
  transactionIndex: string | null;
  feeCurrency?: string | null;
  gatewayFee?: string;
  gatewayFeeRecipient?: string | null;
}

/**
 * Transaction receipt
 */
export interface TransactionReceipt {
  transactionHash: string;
  blockNumber: string;
  blockHash: string;
  from: string;
  to: string | null;
  contractAddress: string | null;
  cumulativeGasUsed: string;
  gasUsed: string;
  effectiveGasPrice: string;
  status: string;
  logs: TransactionLog[];
  logsBloom: string;
}

/**
 * Transaction log
 */
export interface TransactionLog {
  address: string;
  topics: string[];
  data: string;
  blockNumber: string;
  transactionHash: string;
  transactionIndex: string;
  blockHash: string;
  logIndex: string;
  removed: boolean;
}

/**
 * Transaction history item (from explorer)
 */
export interface TransactionHistoryItem {
  hash: string;
  blockNumber: string;
  timeStamp: string;
  from: string;
  to: string;
  value: string;
  valueFormatted: string;
  gas: string;
  gasPrice: string;
  gasUsed: string;
  isError: string;
  txreceipt_status: string;
  input: string;
  contractAddress: string;
  functionName: string;
  methodId: string;
}

/**
 * Token transfer item
 */
export interface TokenTransferItem {
  hash: string;
  blockNumber: string;
  timeStamp: string;
  from: string;
  to: string;
  value: string;
  valueFormatted: string;
  tokenName: string;
  tokenSymbol: string;
  tokenDecimal: string;
  contractAddress: string;
}

/**
 * Identity/Attestation types
 */
export interface IdentifierMapping {
  identifier: string;
  addresses: string[];
  attestationCount: number;
}

export interface AttestationInfo {
  address: string;
  identifier: string;
  completed: number;
  total: number;
  attestations: AttestationData[];
}

export interface AttestationData {
  issuer: string;
  timestamp: number;
  isRevoked: boolean;
}

/**
 * Staking types
 */
export interface ValidatorInfo {
  address: string;
  name?: string;
  ecdsaPublicKey: string;
  blsPublicKey: string;
  affiliation: string;
  score: string;
  signer: string;
}

export interface ValidatorGroupInfo {
  address: string;
  name?: string;
  members: string[];
  commission: string;
  nextCommission: string;
  nextCommissionBlock: string;
  slashingMultiplier: string;
  lastSlashed: string;
}

export interface VoteInfo {
  group: string;
  pending: string;
  active: string;
  pendingFormatted: string;
  activeFormatted: string;
}

export interface StakingReward {
  epoch: number;
  group: string;
  amount: string;
  amountFormatted: string;
  timestamp: number;
}

/**
 * Locked CELO types
 */
export interface LockedBalance {
  address: string;
  total: string;
  totalFormatted: string;
  nonvoting: string;
  nonvotingFormatted: string;
  pendingWithdrawals: PendingWithdrawal[];
}

export interface PendingWithdrawal {
  value: string;
  valueFormatted: string;
  timestamp: number;
  availableAt: Date;
}

/**
 * Exchange/Mento types
 */
export interface ExchangeRate {
  pair: string;
  rate: string;
  inverse: string;
  spread: string;
  timestamp: number;
}

export interface BucketInfo {
  stableBucket: string;
  celoBucket: string;
  stableBucketFormatted: string;
  celoBucketFormatted: string;
}

export interface ExchangeResult {
  transactionHash: string;
  sellAmount: string;
  buyAmount: string;
  sellToken: string;
  buyToken: string;
  effectiveRate: string;
}

/**
 * Governance types
 */
export interface ProposalInfo {
  id: string;
  proposer: string;
  deposit: string;
  depositFormatted: string;
  timestamp: number;
  transactionCount: number;
  descriptionUrl: string;
  stage: string;
  votes: {
    yes: string;
    no: string;
    abstain: string;
  };
}

export interface VoteRecord {
  proposalId: string;
  yesVotes: string;
  noVotes: string;
  abstainVotes: string;
  timestamp: number;
}

export interface GovernanceConstitution {
  concurrentProposals: string;
  dequeueFrequency: string;
  approvalStageDuration: string;
  referendumStageDuration: string;
  executionStageDuration: string;
  participationBaseline: string;
  participationFloor: string;
}

/**
 * Reserve types
 */
export interface ReserveBalance {
  total: string;
  totalFormatted: string;
  assets: ReserveAsset[];
}

export interface ReserveAsset {
  symbol: string;
  address: string;
  balance: string;
  balanceFormatted: string;
}

export interface ReserveRatio {
  ratio: string;
  ratioFormatted: string;
  isHealthy: boolean;
}

/**
 * Smart contract types
 */
export interface ContractCallResult {
  result: unknown;
  decodedResult?: unknown;
}

export interface ContractWriteResult {
  transactionHash: string;
  blockNumber?: string;
  gasUsed?: string;
}

export interface ContractEvent {
  address: string;
  topics: string[];
  data: string;
  blockNumber: string;
  transactionHash: string;
  logIndex: string;
  event?: string;
  args?: Record<string, unknown>;
}

/**
 * Token types
 */
export interface TokenInfo {
  address: string;
  name: string;
  symbol: string;
  decimals: number;
  totalSupply: string;
  totalSupplyFormatted: string;
}

export interface TokenHolder {
  address: string;
  balance: string;
  balanceFormatted: string;
  percentage: string;
}

/**
 * Network types
 */
export interface EpochInfo {
  number: number;
  firstBlock: string;
  lastBlock: string;
  startTimestamp: number;
  endTimestamp?: number;
  validators: string[];
}

export interface NetworkStats {
  chainId: number;
  blockNumber: string;
  gasPrice: string;
  gasPriceFormatted: string;
  epochNumber: number;
  totalValidators: number;
  totalStaked: string;
  totalStakedFormatted: string;
}

export interface GasPriceInfo {
  slow: string;
  standard: string;
  fast: string;
  slowFormatted: string;
  standardFormatted: string;
  fastFormatted: string;
}

/**
 * Utility types
 */
export interface UnitConversion {
  wei: string;
  gwei: string;
  celo: string;
}

export interface HashedIdentifier {
  original: string;
  hash: string;
  pepper?: string;
}

export interface FeeCurrencyOption {
  symbol: string;
  address: string | null;
  name: string;
}

export interface ApiHealthStatus {
  rpc: boolean;
  explorer: boolean;
  latency: number;
  blockNumber: string;
  network: string;
}

/**
 * Trigger types
 */
export interface TriggerData {
  lastProcessedBlock?: string;
  lastProcessedTimestamp?: number;
  lastTransactionHash?: string;
}

export interface WebhookData {
  type: string;
  data: unknown;
  timestamp: number;
  network: string;
}
