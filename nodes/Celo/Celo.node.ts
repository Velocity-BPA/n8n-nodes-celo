/*
 * Copyright (c) Velocity BPA, LLC
 * Licensed under the Business Source License 1.1
 * Commercial use requires a separate commercial license.
 * See LICENSE file for details.
 */

import type {
  IExecuteFunctions,
  INodeExecutionData,
  INodeType,
  INodeTypeDescription,
  IDataObject,
} from 'n8n-workflow';

import {
  makeRpcCall,
  makeExplorerCall,
  getRpcUrl,
  getContractAddress,
  formatUnits,
  parseUnits,
  callContract,
  getGasPrice,
  getBlockNumber,
  estimateGas,
  getLogs,
} from './transport/celoClient';
import {
  hashPhoneNumber,
  getStablecoinAddress,
  getFeeCurrencyOptions,
  convertUnits,
  formatTokenAmount,
  getExchangeAddress,
  calculateEpochFromBlock,
  encodeFunctionData,
  decodeUint256,
  decodeAddress,
  toHex,
} from './utils/helpers';
import { CELO_CONTRACTS, STABLECOINS, GAS_LIMITS } from './constants/celo.constants';
import type {
  CeloCredentials,
  CeloNetwork,
  StablecoinSymbol,
  TransactionData,
  TransactionReceipt,
} from './utils/types';

// Emit licensing notice once on module load
const LICENSING_NOTICE_EMITTED = Symbol.for('n8n-nodes-celo-licensing-notice');
if (!(global as Record<symbol, boolean>)[LICENSING_NOTICE_EMITTED]) {
  console.warn(`
[Velocity BPA Licensing Notice]

This n8n node is licensed under the Business Source License 1.1 (BSL 1.1).

Use of this node by for-profit organizations in production environments requires a commercial license from Velocity BPA.

For licensing information, visit https://velobpa.com/licensing or contact licensing@velobpa.com.
`);
  (global as Record<symbol, boolean>)[LICENSING_NOTICE_EMITTED] = true;
}

export class Celo implements INodeType {
  description: INodeTypeDescription = {
    displayName: 'Celo',
    name: 'celo',
    icon: 'file:celo.svg',
    group: ['transform'],
    version: 1,
    subtitle: '={{$parameter["operation"] + ": " + $parameter["resource"]}}',
    description: 'Interact with Celo blockchain - stablecoins, identity, staking, and governance',
    defaults: {
      name: 'Celo',
    },
    inputs: ['main'],
    outputs: ['main'],
    credentials: [
      {
        name: 'celoApi',
        required: true,
      },
    ],
    properties: [
      // Resource selection
      {
        displayName: 'Resource',
        name: 'resource',
        type: 'options',
        noDataExpression: true,
        options: [
          { name: 'Accounts', value: 'accounts' },
          { name: 'Governance', value: 'governance' },
          { name: 'Identity', value: 'identity' },
          { name: 'Locked CELO', value: 'lockedCelo' },
          { name: 'Network', value: 'network' },
          { name: 'Reserve', value: 'reserve' },
          { name: 'Smart Contracts', value: 'smartContracts' },
          { name: 'Stablecoins (Mento)', value: 'stablecoins' },
          { name: 'Staking (Election)', value: 'staking' },
          { name: 'Tokens', value: 'tokens' },
          { name: 'Transactions', value: 'transactions' },
          { name: 'Utility', value: 'utility' },
        ],
        default: 'accounts',
      },

      // ==================== ACCOUNTS ====================
      {
        displayName: 'Operation',
        name: 'operation',
        type: 'options',
        noDataExpression: true,
        displayOptions: {
          show: { resource: ['accounts'] },
        },
        options: [
          { name: 'Get All Balances', value: 'getAllBalances', description: 'Get all token balances for an address', action: 'Get all balances' },
          { name: 'Get Balance', value: 'getBalance', description: 'Get CELO balance for an address', action: 'Get CELO balance' },
          { name: 'Get Phone Number Mapping', value: 'getPhoneNumberMapping', description: 'Get address for phone number', action: 'Get phone number mapping' },
          { name: 'Get Stable Balance', value: 'getStableBalance', description: 'Get stablecoin balance (cUSD/cEUR/cREAL)', action: 'Get stablecoin balance' },
          { name: 'Get Token Transfers', value: 'getTokenTransfers', description: 'Get token transfer history', action: 'Get token transfers' },
          { name: 'Get Transaction History', value: 'getTransactionHistory', description: 'Get transaction history for an address', action: 'Get transaction history' },
        ],
        default: 'getBalance',
      },

      // ==================== TRANSACTIONS ====================
      {
        displayName: 'Operation',
        name: 'operation',
        type: 'options',
        noDataExpression: true,
        displayOptions: {
          show: { resource: ['transactions'] },
        },
        options: [
          { name: 'Estimate Gas', value: 'estimateGas', description: 'Estimate gas for a transaction', action: 'Estimate gas' },
          { name: 'Get Fee Currency', value: 'getFeeCurrency', description: 'Get supported fee payment tokens', action: 'Get fee currency options' },
          { name: 'Get Transaction', value: 'getTransaction', description: 'Get transaction details by hash', action: 'Get transaction' },
          { name: 'Get Transaction Receipt', value: 'getTransactionReceipt', description: 'Get transaction receipt', action: 'Get transaction receipt' },
          { name: 'Send Stable Payment', value: 'sendStablePayment', description: 'Send stablecoin payment with fee currency', action: 'Send stable payment' },
          { name: 'Send Transaction', value: 'sendTransaction', description: 'Submit a raw transaction', action: 'Send transaction' },
        ],
        default: 'getTransaction',
      },

      // ==================== IDENTITY ====================
      {
        displayName: 'Operation',
        name: 'operation',
        type: 'options',
        noDataExpression: true,
        displayOptions: {
          show: { resource: ['identity'] },
        },
        options: [
          { name: 'Complete Attestation', value: 'completeAttestation', description: 'Complete phone verification', action: 'Complete attestation' },
          { name: 'Get Attestations', value: 'getAttestations', description: 'Get identity proofs for an address', action: 'Get attestations' },
          { name: 'Get Verified Addresses', value: 'getVerifiedAddresses', description: 'Get addresses for an identifier', action: 'Get verified addresses' },
          { name: 'Lookup Identifier', value: 'lookupIdentifier', description: 'Find addresses by phone hash', action: 'Lookup identifier' },
          { name: 'Request Attestation', value: 'requestAttestation', description: 'Start phone verification process', action: 'Request attestation' },
        ],
        default: 'lookupIdentifier',
      },

      // ==================== STABLECOINS ====================
      {
        displayName: 'Operation',
        name: 'operation',
        type: 'options',
        noDataExpression: true,
        displayOptions: {
          show: { resource: ['stablecoins'] },
        },
        options: [
          { name: 'Exchange', value: 'exchange', description: 'Swap CELO ↔ stablecoin', action: 'Exchange tokens' },
          { name: 'Get Bucket Sizes', value: 'getBucketSizes', description: 'Get reserve bucket info', action: 'Get bucket sizes' },
          { name: 'Get Exchange Rate', value: 'getExchangeRate', description: 'Get CELO/stable exchange rate', action: 'Get exchange rate' },
          { name: 'Get Reserve Ratio', value: 'getReserveRatio', description: 'Get stablecoin backing ratio', action: 'Get reserve ratio' },
          { name: 'Get Spread', value: 'getSpread', description: 'Get trading spread', action: 'Get spread' },
        ],
        default: 'getExchangeRate',
      },

      // ==================== STAKING ====================
      {
        displayName: 'Operation',
        name: 'operation',
        type: 'options',
        noDataExpression: true,
        displayOptions: {
          show: { resource: ['staking'] },
        },
        options: [
          { name: 'Activate Votes', value: 'activateVotes', description: 'Activate votes after lockup', action: 'Activate votes' },
          { name: 'Get Pending Votes', value: 'getPendingVotes', description: 'Get votes in-flight', action: 'Get pending votes' },
          { name: 'Get Rewards', value: 'getRewards', description: 'Get staking rewards', action: 'Get rewards' },
          { name: 'Get Validator Groups', value: 'getValidatorGroups', description: 'Get validator groups', action: 'Get validator groups' },
          { name: 'Get Validators', value: 'getValidators', description: 'Get active validators', action: 'Get validators' },
          { name: 'Get Votes', value: 'getVotes', description: 'Get vote distribution', action: 'Get votes' },
          { name: 'Revoke Votes', value: 'revokeVotes', description: 'Remove votes from a group', action: 'Revoke votes' },
          { name: 'Vote for Group', value: 'voteForGroup', description: 'Cast vote for validator group', action: 'Vote for group' },
        ],
        default: 'getValidators',
      },

      // ==================== LOCKED CELO ====================
      {
        displayName: 'Operation',
        name: 'operation',
        type: 'options',
        noDataExpression: true,
        displayOptions: {
          show: { resource: ['lockedCelo'] },
        },
        options: [
          { name: 'Get Locked Balance', value: 'getLockedBalance', description: 'Get locked CELO amount', action: 'Get locked balance' },
          { name: 'Get Pending Withdrawals', value: 'getPendingWithdrawals', description: 'Get queued withdrawals', action: 'Get pending withdrawals' },
          { name: 'Lock CELO', value: 'lockCELO', description: 'Lock CELO for staking', action: 'Lock CELO' },
          { name: 'Unlock CELO', value: 'unlockCELO', description: 'Request CELO unlock', action: 'Unlock CELO' },
          { name: 'Withdraw', value: 'withdraw', description: 'Withdraw after unlock period', action: 'Withdraw' },
        ],
        default: 'getLockedBalance',
      },

      // ==================== GOVERNANCE ====================
      {
        displayName: 'Operation',
        name: 'operation',
        type: 'options',
        noDataExpression: true,
        displayOptions: {
          show: { resource: ['governance'] },
        },
        options: [
          { name: 'Get Constitution', value: 'getConstitution', description: 'Get governance parameters', action: 'Get constitution' },
          { name: 'Get Proposal', value: 'getProposal', description: 'Get single proposal details', action: 'Get proposal' },
          { name: 'Get Proposals', value: 'getProposals', description: 'Get active proposals', action: 'Get proposals' },
          { name: 'Get Vote Record', value: 'getVoteRecord', description: 'Get voting history', action: 'Get vote record' },
          { name: 'Vote on Proposal', value: 'voteOnProposal', description: 'Cast governance vote', action: 'Vote on proposal' },
        ],
        default: 'getProposals',
      },

      // ==================== RESERVE ====================
      {
        displayName: 'Operation',
        name: 'operation',
        type: 'options',
        noDataExpression: true,
        displayOptions: {
          show: { resource: ['reserve'] },
        },
        options: [
          { name: 'Get Reserve Assets', value: 'getReserveAssets', description: 'Get reserve composition', action: 'Get reserve assets' },
          { name: 'Get Reserve Balance', value: 'getReserveBalance', description: 'Get multi-asset reserve balance', action: 'Get reserve balance' },
          { name: 'Get Reserve Ratio', value: 'getReserveRatio', description: 'Get reserve health', action: 'Get reserve ratio' },
          { name: 'Get Tobin Tax', value: 'getTobinsTax', description: 'Get trading fee threshold', action: 'Get Tobin tax' },
        ],
        default: 'getReserveBalance',
      },

      // ==================== SMART CONTRACTS ====================
      {
        displayName: 'Operation',
        name: 'operation',
        type: 'options',
        noDataExpression: true,
        displayOptions: {
          show: { resource: ['smartContracts'] },
        },
        options: [
          { name: 'Get Contract Events', value: 'getContractEvents', description: 'Get event logs from contract', action: 'Get contract events' },
          { name: 'Read Contract', value: 'readContract', description: 'Call view function on contract', action: 'Read contract' },
          { name: 'Write Contract', value: 'writeContract', description: 'Send transaction to contract', action: 'Write contract' },
        ],
        default: 'readContract',
      },

      // ==================== TOKENS ====================
      {
        displayName: 'Operation',
        name: 'operation',
        type: 'options',
        noDataExpression: true,
        displayOptions: {
          show: { resource: ['tokens'] },
        },
        options: [
          { name: 'Get Token Holders', value: 'getTokenHolders', description: 'Get holder list for a token', action: 'Get token holders' },
          { name: 'Get Token Info', value: 'getTokenInfo', description: 'Get token details', action: 'Get token info' },
          { name: 'Get Token Transfers', value: 'getTokenTransfers', description: 'Get transfer history for a token', action: 'Get token transfers' },
        ],
        default: 'getTokenInfo',
      },

      // ==================== NETWORK ====================
      {
        displayName: 'Operation',
        name: 'operation',
        type: 'options',
        noDataExpression: true,
        displayOptions: {
          show: { resource: ['network'] },
        },
        options: [
          { name: 'Get Elected Validators', value: 'getElectedValidators', description: 'Get current validator set', action: 'Get elected validators' },
          { name: 'Get Epoch Info', value: 'getEpochInfo', description: 'Get current epoch', action: 'Get epoch info' },
          { name: 'Get Gas Price', value: 'getGasPrice', description: 'Get current gas price', action: 'Get gas price' },
          { name: 'Get Network Stats', value: 'getNetworkStats', description: 'Get chain metrics', action: 'Get network stats' },
        ],
        default: 'getNetworkStats',
      },

      // ==================== UTILITY ====================
      {
        displayName: 'Operation',
        name: 'operation',
        type: 'options',
        noDataExpression: true,
        displayOptions: {
          show: { resource: ['utility'] },
        },
        options: [
          { name: 'Convert Units', value: 'convertUnits', description: 'Convert between CELO/Wei/Gwei', action: 'Convert units' },
          { name: 'Get API Health', value: 'getAPIHealth', description: 'Check service status', action: 'Get API health' },
          { name: 'Get Fee Currency Options', value: 'getFeeCurrencyOptions', description: 'Get tokens for gas payment', action: 'Get fee currency options' },
          { name: 'Hash Identifier', value: 'hashIdentifier', description: 'Create phone number hash', action: 'Hash identifier' },
        ],
        default: 'convertUnits',
      },

      // ==================== PARAMETERS ====================
      
      // Address parameter (used by multiple operations)
      {
        displayName: 'Address',
        name: 'address',
        type: 'string',
        default: '',
        placeholder: '0x...',
        required: true,
        description: 'Celo address (0x...)',
        displayOptions: {
          show: {
            resource: ['accounts', 'lockedCelo', 'staking', 'governance'],
            operation: [
              'getBalance', 'getStableBalance', 'getAllBalances', 'getTransactionHistory', 'getTokenTransfers',
              'getLockedBalance', 'getPendingWithdrawals',
              'getPendingVotes', 'getVotes', 'getRewards',
              'getVoteRecord',
            ],
          },
        },
      },

      // Transaction hash parameter
      {
        displayName: 'Transaction Hash',
        name: 'transactionHash',
        type: 'string',
        default: '',
        placeholder: '0x...',
        required: true,
        description: 'Transaction hash (0x...)',
        displayOptions: {
          show: {
            resource: ['transactions'],
            operation: ['getTransaction', 'getTransactionReceipt'],
          },
        },
      },

      // Stablecoin selection
      {
        displayName: 'Stablecoin',
        name: 'stablecoin',
        type: 'options',
        options: [
          { name: 'cUSD (Celo Dollar)', value: 'cUSD' },
          { name: 'cEUR (Celo Euro)', value: 'cEUR' },
          { name: 'cREAL (Celo Real)', value: 'cREAL' },
        ],
        default: 'cUSD',
        required: true,
        displayOptions: {
          show: {
            resource: ['accounts', 'stablecoins'],
            operation: ['getStableBalance', 'getExchangeRate', 'exchange', 'getBucketSizes', 'getSpread'],
          },
        },
      },

      // Phone number for identity
      {
        displayName: 'Phone Number',
        name: 'phoneNumber',
        type: 'string',
        default: '',
        placeholder: '+1234567890',
        required: true,
        description: 'Phone number in E.164 format',
        displayOptions: {
          show: {
            resource: ['identity', 'utility'],
            operation: ['lookupIdentifier', 'getVerifiedAddresses', 'hashIdentifier'],
          },
        },
      },

      // Identifier hash for identity
      {
        displayName: 'Identifier Hash',
        name: 'identifierHash',
        type: 'string',
        default: '',
        placeholder: '0x...',
        description: 'Hashed phone number identifier',
        displayOptions: {
          show: {
            resource: ['identity'],
            operation: ['getAttestations', 'requestAttestation', 'completeAttestation'],
          },
        },
      },

      // Amount parameter
      {
        displayName: 'Amount',
        name: 'amount',
        type: 'string',
        default: '0',
        required: true,
        description: 'Amount in token units (e.g., 1.5 for 1.5 CELO)',
        displayOptions: {
          show: {
            resource: ['transactions', 'stablecoins', 'lockedCelo', 'staking'],
            operation: ['sendTransaction', 'sendStablePayment', 'exchange', 'lockCELO', 'unlockCELO', 'voteForGroup', 'revokeVotes'],
          },
        },
      },

      // To address parameter
      {
        displayName: 'To Address',
        name: 'toAddress',
        type: 'string',
        default: '',
        placeholder: '0x...',
        required: true,
        description: 'Recipient address',
        displayOptions: {
          show: {
            resource: ['transactions'],
            operation: ['sendTransaction', 'sendStablePayment', 'estimateGas'],
          },
        },
      },

      // Fee currency selection
      {
        displayName: 'Fee Currency',
        name: 'feeCurrency',
        type: 'options',
        options: [
          { name: 'CELO (Native)', value: 'CELO' },
          { name: 'cUSD', value: 'cUSD' },
          { name: 'cEUR', value: 'cEUR' },
          { name: 'cREAL', value: 'cREAL' },
        ],
        default: 'CELO',
        description: 'Token to pay gas fees with',
        displayOptions: {
          show: {
            resource: ['transactions'],
            operation: ['sendTransaction', 'sendStablePayment'],
          },
        },
      },

      // Validator group address
      {
        displayName: 'Group Address',
        name: 'groupAddress',
        type: 'string',
        default: '',
        placeholder: '0x...',
        required: true,
        description: 'Validator group address',
        displayOptions: {
          show: {
            resource: ['staking'],
            operation: ['voteForGroup', 'revokeVotes', 'activateVotes'],
          },
        },
      },

      // Proposal ID
      {
        displayName: 'Proposal ID',
        name: 'proposalId',
        type: 'number',
        default: 1,
        required: true,
        description: 'Governance proposal ID',
        displayOptions: {
          show: {
            resource: ['governance'],
            operation: ['getProposal', 'voteOnProposal'],
          },
        },
      },

      // Vote value
      {
        displayName: 'Vote',
        name: 'voteValue',
        type: 'options',
        options: [
          { name: 'Yes', value: 'Yes' },
          { name: 'No', value: 'No' },
          { name: 'Abstain', value: 'Abstain' },
        ],
        default: 'Yes',
        required: true,
        displayOptions: {
          show: {
            resource: ['governance'],
            operation: ['voteOnProposal'],
          },
        },
      },

      // Contract address
      {
        displayName: 'Contract Address',
        name: 'contractAddress',
        type: 'string',
        default: '',
        placeholder: '0x...',
        required: true,
        description: 'Smart contract address',
        displayOptions: {
          show: {
            resource: ['smartContracts', 'tokens'],
            operation: ['readContract', 'writeContract', 'getContractEvents', 'getTokenInfo', 'getTokenHolders', 'getTokenTransfers'],
          },
        },
      },

      // Function name
      {
        displayName: 'Function Name',
        name: 'functionName',
        type: 'string',
        default: '',
        placeholder: 'balanceOf',
        required: true,
        description: 'Contract function name to call',
        displayOptions: {
          show: {
            resource: ['smartContracts'],
            operation: ['readContract', 'writeContract'],
          },
        },
      },

      // Function parameters
      {
        displayName: 'Function Parameters',
        name: 'functionParams',
        type: 'json',
        default: '[]',
        description: 'Parameters as JSON array',
        displayOptions: {
          show: {
            resource: ['smartContracts'],
            operation: ['readContract', 'writeContract'],
          },
        },
      },

      // Block range for events
      {
        displayName: 'From Block',
        name: 'fromBlock',
        type: 'string',
        default: 'latest',
        description: 'Start block number or "latest"',
        displayOptions: {
          show: {
            resource: ['smartContracts'],
            operation: ['getContractEvents'],
          },
        },
      },
      {
        displayName: 'To Block',
        name: 'toBlock',
        type: 'string',
        default: 'latest',
        description: 'End block number or "latest"',
        displayOptions: {
          show: {
            resource: ['smartContracts'],
            operation: ['getContractEvents'],
          },
        },
      },

      // Exchange direction
      {
        displayName: 'Direction',
        name: 'exchangeDirection',
        type: 'options',
        options: [
          { name: 'CELO → Stablecoin', value: 'celoToStable' },
          { name: 'Stablecoin → CELO', value: 'stableToCelo' },
        ],
        default: 'celoToStable',
        required: true,
        displayOptions: {
          show: {
            resource: ['stablecoins'],
            operation: ['exchange'],
          },
        },
      },

      // Unit conversion parameters
      {
        displayName: 'Value',
        name: 'value',
        type: 'string',
        default: '1000000000000000000',
        required: true,
        description: 'Value to convert',
        displayOptions: {
          show: {
            resource: ['utility'],
            operation: ['convertUnits'],
          },
        },
      },
      {
        displayName: 'From Unit',
        name: 'fromUnit',
        type: 'options',
        options: [
          { name: 'Wei', value: 'wei' },
          { name: 'Gwei', value: 'gwei' },
          { name: 'CELO', value: 'celo' },
        ],
        default: 'wei',
        required: true,
        displayOptions: {
          show: {
            resource: ['utility'],
            operation: ['convertUnits'],
          },
        },
      },

      // Withdrawal index
      {
        displayName: 'Withdrawal Index',
        name: 'withdrawalIndex',
        type: 'number',
        default: 0,
        required: true,
        description: 'Index of the pending withdrawal to complete',
        displayOptions: {
          show: {
            resource: ['lockedCelo'],
            operation: ['withdraw'],
          },
        },
      },

      // Additional options
      {
        displayName: 'Options',
        name: 'options',
        type: 'collection',
        placeholder: 'Add Option',
        default: {},
        options: [
          {
            displayName: 'Limit',
            name: 'limit',
            type: 'number',
            default: 100,
            description: 'Maximum number of results to return',
          },
          {
            displayName: 'Offset',
            name: 'offset',
            type: 'number',
            default: 0,
            description: 'Number of results to skip',
          },
          {
            displayName: 'Sort',
            name: 'sort',
            type: 'options',
            options: [
              { name: 'Ascending', value: 'asc' },
              { name: 'Descending', value: 'desc' },
            ],
            default: 'desc',
          },
        ],
        displayOptions: {
          show: {
            resource: ['accounts', 'tokens'],
            operation: ['getTransactionHistory', 'getTokenTransfers', 'getTokenHolders'],
          },
        },
      },
    ],
  };

  async execute(this: IExecuteFunctions): Promise<INodeExecutionData[][]> {
    const items = this.getInputData();
    const returnData: INodeExecutionData[] = [];
    const resource = this.getNodeParameter('resource', 0) as string;
    const operation = this.getNodeParameter('operation', 0) as string;

    for (let i = 0; i < items.length; i++) {
      try {
        let result: IDataObject = {};
        const credentials = await this.getCredentials('celoApi') as CeloCredentials;
        const network = credentials.network as CeloNetwork;

        // ==================== ACCOUNTS ====================
        if (resource === 'accounts') {
          if (operation === 'getBalance') {
            const address = this.getNodeParameter('address', i) as string;
            const balance = await makeRpcCall<string>(this, 'eth_getBalance', [address, 'latest'], i);
            result = {
              address,
              balance,
              balanceFormatted: formatUnits(balance),
              symbol: 'CELO',
              network,
            };
          }

          if (operation === 'getStableBalance') {
            const address = this.getNodeParameter('address', i) as string;
            const stablecoin = this.getNodeParameter('stablecoin', i) as StablecoinSymbol;
            const tokenAddress = getStablecoinAddress(stablecoin, network);
            
            const data = encodeFunctionData('balanceOf', [address]);
            const balanceHex = await callContract(this, tokenAddress, data, i);
            const balance = decodeUint256(balanceHex);
            
            result = {
              address,
              tokenAddress,
              balance,
              balanceFormatted: formatTokenAmount(balance),
              symbol: stablecoin,
              network,
            };
          }

          if (operation === 'getAllBalances') {
            const address = this.getNodeParameter('address', i) as string;
            
            // Get CELO balance
            const celoBalance = await makeRpcCall<string>(this, 'eth_getBalance', [address, 'latest'], i);
            
            // Get stablecoin balances
            const balances: Record<string, string> = { CELO: celoBalance };
            const balancesFormatted: Record<string, string> = { CELO: formatUnits(celoBalance) };
            
            for (const [symbol, config] of Object.entries(STABLECOINS)) {
              const tokenAddress = network === 'mainnet' || network === 'custom' 
                ? config.mainnet 
                : config.alfajores;
              const data = encodeFunctionData('balanceOf', [address]);
              const balanceHex = await callContract(this, tokenAddress, data, i);
              const balance = decodeUint256(balanceHex);
              balances[symbol] = balance;
              balancesFormatted[symbol] = formatTokenAmount(balance);
            }
            
            result = {
              address,
              network,
              balances,
              balancesFormatted,
            };
          }

          if (operation === 'getTransactionHistory') {
            const address = this.getNodeParameter('address', i) as string;
            const options = this.getNodeParameter('options', i) as IDataObject;
            
            const transactions = await makeExplorerCall<unknown[]>(
              this,
              {
                module: 'account',
                action: 'txlist',
                address,
                startblock: '0',
                endblock: '99999999',
                page: '1',
                offset: String(options.limit || 100),
                sort: String(options.sort || 'desc'),
              },
              i
            );
            
            result = {
              address,
              transactions: Array.isArray(transactions) ? transactions.map((tx: unknown) => {
                const txData = tx as Record<string, string>;
                return {
                  ...txData,
                  valueFormatted: formatUnits(txData.value || '0'),
                };
              }) : [],
              count: Array.isArray(transactions) ? transactions.length : 0,
            };
          }

          if (operation === 'getTokenTransfers') {
            const address = this.getNodeParameter('address', i) as string;
            const options = this.getNodeParameter('options', i) as IDataObject;
            
            const transfers = await makeExplorerCall<unknown[]>(
              this,
              {
                module: 'account',
                action: 'tokentx',
                address,
                startblock: '0',
                endblock: '99999999',
                page: '1',
                offset: String(options.limit || 100),
                sort: String(options.sort || 'desc'),
              },
              i
            );
            
            result = {
              address,
              transfers: Array.isArray(transfers) ? transfers.map((tx: unknown) => {
                const txData = tx as Record<string, string>;
                return {
                  ...txData,
                  valueFormatted: formatTokenAmount(txData.value || '0', parseInt(txData.tokenDecimal || '18')),
                };
              }) : [],
              count: Array.isArray(transfers) ? transfers.length : 0,
            };
          }

          if (operation === 'getPhoneNumberMapping') {
            const phoneNumber = this.getNodeParameter('phoneNumber', i) as string;
            const hashedId = hashPhoneNumber(phoneNumber);
            
            // Note: Full ODIS integration requires the Celo SDK
            // This is a simplified lookup using the FederatedAttestations contract
            result = {
              phoneNumber,
              hashedIdentifier: hashedId.hash,
              note: 'Full identity lookup requires ODIS integration. Use the hashed identifier with the FederatedAttestations contract.',
            };
          }
        }

        // ==================== TRANSACTIONS ====================
        if (resource === 'transactions') {
          if (operation === 'getTransaction') {
            const transactionHash = this.getNodeParameter('transactionHash', i) as string;
            const tx = await makeRpcCall<TransactionData>(this, 'eth_getTransactionByHash', [transactionHash], i);
            
            if (tx) {
              result = {
                ...tx,
                valueFormatted: formatUnits(tx.value || '0'),
              };
            } else {
              result = { error: 'Transaction not found' };
            }
          }

          if (operation === 'getTransactionReceipt') {
            const transactionHash = this.getNodeParameter('transactionHash', i) as string;
            const receipt = await makeRpcCall<TransactionReceipt>(this, 'eth_getTransactionReceipt', [transactionHash], i);
            
            if (receipt) {
              result = {
                ...receipt,
                success: receipt.status === '0x1',
              };
            } else {
              result = { error: 'Transaction receipt not found' };
            }
          }

          if (operation === 'sendTransaction') {
            // Note: Actual transaction signing requires proper key management
            result = {
              error: 'Transaction sending requires private key signing. Please use a signing service or implement proper transaction signing.',
              hint: 'Use the Celo SDK or web3.js with your private key for transaction signing.',
            };
          }

          if (operation === 'sendStablePayment') {
            // Note: Actual transaction signing requires proper key management
            result = {
              error: 'Stablecoin payments require transaction signing. Please use a signing service.',
              hint: 'Use the Celo SDK for fee-abstracted stablecoin transfers.',
            };
          }

          if (operation === 'estimateGas') {
            const toAddress = this.getNodeParameter('toAddress', i) as string;
            const amount = this.getNodeParameter('amount', i) as string;
            
            const gasEstimate = await estimateGas(
              this,
              {
                to: toAddress,
                value: toHex(parseUnits(amount)),
              },
              i
            );
            
            const gasPrice = await getGasPrice(this, i);
            const totalCost = BigInt(gasEstimate) * BigInt(gasPrice);
            
            result = {
              gasEstimate,
              gasEstimateDecimal: parseInt(gasEstimate, 16),
              gasPrice,
              gasPriceFormatted: formatUnits(gasPrice, 9) + ' Gwei',
              estimatedCost: totalCost.toString(),
              estimatedCostFormatted: formatUnits(totalCost.toString()) + ' CELO',
            };
          }

          if (operation === 'getFeeCurrency') {
            const options = getFeeCurrencyOptions(network);
            result = {
              network,
              feeCurrencies: options,
            };
          }
        }

        // ==================== IDENTITY ====================
        if (resource === 'identity') {
          if (operation === 'lookupIdentifier') {
            const phoneNumber = this.getNodeParameter('phoneNumber', i) as string;
            const hashedId = hashPhoneNumber(phoneNumber);
            
            result = {
              phoneNumber,
              hashedIdentifier: hashedId.hash,
              note: 'Full ODIS lookup requires the Celo SDK. This hash can be used with the Attestations contract.',
            };
          }

          if (operation === 'getAttestations') {
            const identifierHash = this.getNodeParameter('identifierHash', i) as string;
            const attestationsContract = getContractAddress(network, 'Attestations');
            
            result = {
              identifierHash,
              attestationsContract,
              note: 'Query the Attestations contract with this identifier hash for attestation data.',
            };
          }

          if (operation === 'getVerifiedAddresses') {
            const phoneNumber = this.getNodeParameter('phoneNumber', i) as string;
            const hashedId = hashPhoneNumber(phoneNumber);
            
            result = {
              phoneNumber,
              hashedIdentifier: hashedId.hash,
              note: 'Use FederatedAttestations.lookupAttestations() with this hash to find verified addresses.',
            };
          }

          if (operation === 'requestAttestation' || operation === 'completeAttestation') {
            result = {
              error: 'Attestation operations require transaction signing and ODIS integration.',
              hint: 'Use the Celo SDK @celo/identity package for attestation workflows.',
            };
          }
        }

        // ==================== STABLECOINS ====================
        if (resource === 'stablecoins') {
          if (operation === 'getExchangeRate') {
            const stablecoin = this.getNodeParameter('stablecoin', i) as StablecoinSymbol;
            const exchangeAddress = getExchangeAddress(stablecoin, network);
            
            // Get buy amount for 1 CELO
            const oneEther = '1000000000000000000'; // 1 CELO in wei
            const sellGoldData = '0x' + 
              'f8b8e9c7' + // getBuyTokenAmount selector (simplified)
              oneEther.padStart(64, '0') +
              '1'.padStart(64, '0'); // sellGold = true
            
            // Note: Actual exchange rate calculation requires proper ABI encoding
            result = {
              pair: `CELO/${stablecoin}`,
              exchangeContract: exchangeAddress,
              note: 'Use the Exchange contract getBuyTokenAmount() for accurate rates.',
              network,
            };
          }

          if (operation === 'getBucketSizes') {
            const stablecoin = this.getNodeParameter('stablecoin', i) as StablecoinSymbol;
            const exchangeAddress = getExchangeAddress(stablecoin, network);
            
            result = {
              stablecoin,
              exchangeContract: exchangeAddress,
              note: 'Call getBuyAndSellBuckets() on the Exchange contract for bucket sizes.',
              network,
            };
          }

          if (operation === 'getSpread') {
            const stablecoin = this.getNodeParameter('stablecoin', i) as StablecoinSymbol;
            const exchangeAddress = getExchangeAddress(stablecoin, network);
            
            result = {
              stablecoin,
              exchangeContract: exchangeAddress,
              note: 'Call spread() on the Exchange contract to get the trading spread.',
              network,
            };
          }

          if (operation === 'getReserveRatio') {
            const reserveAddress = getContractAddress(network, 'Reserve');
            
            result = {
              reserveContract: reserveAddress,
              note: 'Call getReserveRatio() on the Reserve contract.',
              network,
            };
          }

          if (operation === 'exchange') {
            result = {
              error: 'Exchange operations require transaction signing.',
              hint: 'Use the Celo SDK or web3.js to call the Exchange contract.',
            };
          }
        }

        // ==================== STAKING ====================
        if (resource === 'staking') {
          if (operation === 'getValidators') {
            const validatorsContract = getContractAddress(network, 'Validators');
            
            // Call getRegisteredValidators()
            const data = '0xd55dcbcf'; // getRegisteredValidators() selector
            const resultHex = await callContract(this, validatorsContract, data, i);
            
            result = {
              validatorsContract,
              rawResult: resultHex,
              note: 'Decode the result to get the list of registered validators.',
              network,
            };
          }

          if (operation === 'getValidatorGroups') {
            const validatorsContract = getContractAddress(network, 'Validators');
            
            // Call getRegisteredValidatorGroups()
            const data = '0x3f270898'; // getRegisteredValidatorGroups() selector
            const resultHex = await callContract(this, validatorsContract, data, i);
            
            result = {
              validatorsContract,
              rawResult: resultHex,
              note: 'Decode the result to get the list of validator groups.',
              network,
            };
          }

          if (operation === 'getVotes') {
            const address = this.getNodeParameter('address', i) as string;
            const electionContract = getContractAddress(network, 'Election');
            
            result = {
              address,
              electionContract,
              note: 'Call getVotesForAccount() or getGroupsVotedForByAccount() for vote details.',
              network,
            };
          }

          if (operation === 'getPendingVotes') {
            const address = this.getNodeParameter('address', i) as string;
            const electionContract = getContractAddress(network, 'Election');
            
            result = {
              address,
              electionContract,
              note: 'Call getPendingVotesForGroup() for pending vote amounts.',
              network,
            };
          }

          if (operation === 'getRewards') {
            const address = this.getNodeParameter('address', i) as string;
            
            result = {
              address,
              note: 'Staking rewards are distributed via epoch rewards. Check transaction history for reward distributions.',
              network,
            };
          }

          if (operation === 'voteForGroup' || operation === 'revokeVotes' || operation === 'activateVotes') {
            result = {
              error: 'Voting operations require transaction signing.',
              hint: 'Use the Celo SDK or web3.js to interact with the Election contract.',
            };
          }
        }

        // ==================== LOCKED CELO ====================
        if (resource === 'lockedCelo') {
          if (operation === 'getLockedBalance') {
            const address = this.getNodeParameter('address', i) as string;
            const lockedGoldContract = getContractAddress(network, 'LockedGold');
            
            // Call getAccountTotalLockedGold(address)
            const data = '0x30ec70f5' + address.toLowerCase().replace('0x', '').padStart(64, '0');
            const resultHex = await callContract(this, lockedGoldContract, data, i);
            const balance = decodeUint256(resultHex);
            
            result = {
              address,
              lockedBalance: balance,
              lockedBalanceFormatted: formatTokenAmount(balance),
              lockedGoldContract,
              network,
            };
          }

          if (operation === 'getPendingWithdrawals') {
            const address = this.getNodeParameter('address', i) as string;
            const lockedGoldContract = getContractAddress(network, 'LockedGold');
            
            result = {
              address,
              lockedGoldContract,
              note: 'Call getPendingWithdrawals() to get withdrawal values and timestamps.',
              network,
            };
          }

          if (operation === 'lockCELO' || operation === 'unlockCELO' || operation === 'withdraw') {
            result = {
              error: 'Lock/unlock operations require transaction signing.',
              hint: 'Use the Celo SDK or web3.js to interact with the LockedGold contract.',
            };
          }
        }

        // ==================== GOVERNANCE ====================
        if (resource === 'governance') {
          if (operation === 'getProposals') {
            const governanceContract = getContractAddress(network, 'Governance');
            
            // Call proposalCount()
            const data = '0xda35c664'; // proposalCount() selector
            const resultHex = await callContract(this, governanceContract, data, i);
            const count = decodeUint256(resultHex);
            
            result = {
              governanceContract,
              proposalCount: count,
              note: 'Use getProposal() to get details for each proposal ID.',
              network,
            };
          }

          if (operation === 'getProposal') {
            const proposalId = this.getNodeParameter('proposalId', i) as number;
            const governanceContract = getContractAddress(network, 'Governance');
            
            result = {
              proposalId,
              governanceContract,
              note: 'Call getProposal() with the proposal ID for full details.',
              network,
            };
          }

          if (operation === 'getVoteRecord') {
            const address = this.getNodeParameter('address', i) as string;
            const governanceContract = getContractAddress(network, 'Governance');
            
            result = {
              address,
              governanceContract,
              note: 'Call getVoteRecord() for the account voting history.',
              network,
            };
          }

          if (operation === 'getConstitution') {
            const governanceContract = getContractAddress(network, 'Governance');
            
            result = {
              governanceContract,
              note: 'Query the Governance contract for constitution parameters.',
              network,
            };
          }

          if (operation === 'voteOnProposal') {
            result = {
              error: 'Voting requires transaction signing.',
              hint: 'Use the Celo SDK or web3.js to vote on governance proposals.',
            };
          }
        }

        // ==================== RESERVE ====================
        if (resource === 'reserve') {
          const reserveContract = getContractAddress(network, 'Reserve');

          if (operation === 'getReserveBalance') {
            // Get CELO balance of reserve
            const balance = await makeRpcCall<string>(this, 'eth_getBalance', [reserveContract, 'latest'], i);
            
            result = {
              reserveContract,
              celoBalance: balance,
              celoBalanceFormatted: formatUnits(balance),
              note: 'Reserve holds multiple assets. Query individual token balances for full composition.',
              network,
            };
          }

          if (operation === 'getReserveRatio') {
            result = {
              reserveContract,
              note: 'Call getReserveRatio() on the Reserve contract.',
              network,
            };
          }

          if (operation === 'getReserveAssets') {
            result = {
              reserveContract,
              note: 'The reserve holds CELO and other assets. Query token balances of the reserve address.',
              network,
            };
          }

          if (operation === 'getTobinsTax') {
            result = {
              reserveContract,
              note: 'Call tobinTaxStalenessThreshold() on the Reserve contract.',
              network,
            };
          }
        }

        // ==================== SMART CONTRACTS ====================
        if (resource === 'smartContracts') {
          if (operation === 'readContract') {
            const contractAddress = this.getNodeParameter('contractAddress', i) as string;
            const functionName = this.getNodeParameter('functionName', i) as string;
            const functionParams = this.getNodeParameter('functionParams', i) as string;
            
            const params = JSON.parse(functionParams || '[]');
            const data = encodeFunctionData(functionName, params);
            const resultHex = await callContract(this, contractAddress, data, i);
            
            result = {
              contractAddress,
              functionName,
              params,
              rawResult: resultHex,
              note: 'Decode the raw result based on the expected return type.',
            };
          }

          if (operation === 'getContractEvents') {
            const contractAddress = this.getNodeParameter('contractAddress', i) as string;
            const fromBlock = this.getNodeParameter('fromBlock', i) as string;
            const toBlock = this.getNodeParameter('toBlock', i) as string;
            
            const logs = await getLogs(
              this,
              {
                fromBlock: fromBlock === 'latest' ? 'latest' : toHex(parseInt(fromBlock)),
                toBlock: toBlock === 'latest' ? 'latest' : toHex(parseInt(toBlock)),
                address: contractAddress,
              },
              i
            );
            
            result = {
              contractAddress,
              fromBlock,
              toBlock,
              events: logs,
              count: logs.length,
            };
          }

          if (operation === 'writeContract') {
            result = {
              error: 'Contract writes require transaction signing.',
              hint: 'Use the Celo SDK or web3.js to send transactions to contracts.',
            };
          }
        }

        // ==================== TOKENS ====================
        if (resource === 'tokens') {
          if (operation === 'getTokenInfo') {
            const contractAddress = this.getNodeParameter('contractAddress', i) as string;
            
            // Get basic token info
            const nameData = encodeFunctionData('name', []);
            const symbolData = encodeFunctionData('symbol', []);
            const decimalsData = encodeFunctionData('decimals', []);
            const totalSupplyData = encodeFunctionData('totalSupply', []);
            
            const [nameHex, symbolHex, decimalsHex, totalSupplyHex] = await Promise.all([
              callContract(this, contractAddress, nameData, i).catch(() => '0x'),
              callContract(this, contractAddress, symbolData, i).catch(() => '0x'),
              callContract(this, contractAddress, decimalsData, i).catch(() => '0x12'), // Default 18
              callContract(this, contractAddress, totalSupplyData, i).catch(() => '0x0'),
            ]);
            
            const decimals = parseInt(decimalsHex, 16) || 18;
            const totalSupply = decodeUint256(totalSupplyHex);
            
            result = {
              address: contractAddress,
              decimals,
              totalSupply,
              totalSupplyFormatted: formatTokenAmount(totalSupply, decimals),
              note: 'Name and symbol require string decoding from the raw hex values.',
              nameHex,
              symbolHex,
            };
          }

          if (operation === 'getTokenHolders') {
            const contractAddress = this.getNodeParameter('contractAddress', i) as string;
            const options = this.getNodeParameter('options', i) as IDataObject;
            
            const holders = await makeExplorerCall<unknown[]>(
              this,
              {
                module: 'token',
                action: 'tokenholderlist',
                contractaddress: contractAddress,
                page: '1',
                offset: String(options.limit || 100),
              },
              i
            );
            
            result = {
              contractAddress,
              holders: holders || [],
              count: Array.isArray(holders) ? holders.length : 0,
            };
          }

          if (operation === 'getTokenTransfers') {
            const contractAddress = this.getNodeParameter('contractAddress', i) as string;
            const options = this.getNodeParameter('options', i) as IDataObject;
            
            const transfers = await makeExplorerCall<unknown[]>(
              this,
              {
                module: 'account',
                action: 'tokentx',
                contractaddress: contractAddress,
                page: '1',
                offset: String(options.limit || 100),
                sort: String(options.sort || 'desc'),
              },
              i
            );
            
            result = {
              contractAddress,
              transfers: transfers || [],
              count: Array.isArray(transfers) ? transfers.length : 0,
            };
          }
        }

        // ==================== NETWORK ====================
        if (resource === 'network') {
          if (operation === 'getNetworkStats') {
            const [blockNumberHex, gasPriceHex, chainIdHex] = await Promise.all([
              getBlockNumber(this, i),
              getGasPrice(this, i),
              makeRpcCall<string>(this, 'eth_chainId', [], i),
            ]);
            
            const blockNumber = parseInt(blockNumberHex, 16);
            const epochNumber = calculateEpochFromBlock(blockNumber);
            
            result = {
              chainId: parseInt(chainIdHex, 16),
              blockNumber: blockNumber.toString(),
              gasPrice: gasPriceHex,
              gasPriceFormatted: formatUnits(gasPriceHex, 9) + ' Gwei',
              epochNumber,
              network,
            };
          }

          if (operation === 'getGasPrice') {
            const gasPriceHex = await getGasPrice(this, i);
            const gasPrice = BigInt(gasPriceHex);
            
            result = {
              gasPrice: gasPrice.toString(),
              gasPriceGwei: formatUnits(gasPrice.toString(), 9),
              gasPriceHex,
              network,
            };
          }

          if (operation === 'getEpochInfo') {
            const blockNumberHex = await getBlockNumber(this, i);
            const blockNumber = parseInt(blockNumberHex, 16);
            const epochNumber = calculateEpochFromBlock(blockNumber);
            const epochSize = 17280;
            
            result = {
              currentEpoch: epochNumber,
              currentBlock: blockNumber,
              epochStartBlock: epochNumber * epochSize,
              epochEndBlock: (epochNumber + 1) * epochSize - 1,
              blocksRemainingInEpoch: ((epochNumber + 1) * epochSize) - blockNumber,
              network,
            };
          }

          if (operation === 'getElectedValidators') {
            const electionContract = getContractAddress(network, 'Election');
            
            // Call electValidatorSigners()
            const data = '0x07c289c0'; // electValidatorSigners() selector
            const resultHex = await callContract(this, electionContract, data, i);
            
            result = {
              electionContract,
              rawResult: resultHex,
              note: 'Decode the result to get the list of elected validator signers.',
              network,
            };
          }
        }

        // ==================== UTILITY ====================
        if (resource === 'utility') {
          if (operation === 'convertUnits') {
            const value = this.getNodeParameter('value', i) as string;
            const fromUnit = this.getNodeParameter('fromUnit', i) as 'wei' | 'gwei' | 'celo';
            
            const converted = convertUnits(value, fromUnit);
            result = {
              input: value,
              inputUnit: fromUnit,
              ...converted,
            };
          }

          if (operation === 'hashIdentifier') {
            const phoneNumber = this.getNodeParameter('phoneNumber', i) as string;
            const hashedId = hashPhoneNumber(phoneNumber);
            
            result = {
              phoneNumber,
              normalizedNumber: hashedId.original,
              hash: hashedId.hash,
              note: 'This is a simplified hash. Full ODIS integration provides oblivious hashing.',
            };
          }

          if (operation === 'getFeeCurrencyOptions') {
            const options = getFeeCurrencyOptions(network);
            result = {
              network,
              feeCurrencies: options,
            };
          }

          if (operation === 'getAPIHealth') {
            const startTime = Date.now();
            
            try {
              const [blockNumberHex, chainIdHex] = await Promise.all([
                getBlockNumber(this, i),
                makeRpcCall<string>(this, 'eth_chainId', [], i),
              ]);
              
              const latency = Date.now() - startTime;
              
              result = {
                status: 'healthy',
                rpc: true,
                latency,
                blockNumber: parseInt(blockNumberHex, 16).toString(),
                chainId: parseInt(chainIdHex, 16),
                network,
                rpcUrl: getRpcUrl(credentials),
              };
            } catch (error) {
              result = {
                status: 'unhealthy',
                rpc: false,
                error: (error as Error).message,
                network,
              };
            }
          }
        }

        returnData.push({ json: result });
      } catch (error) {
        if (this.continueOnFail()) {
          returnData.push({
            json: {
              error: (error as Error).message,
            },
          });
          continue;
        }
        throw error;
      }
    }

    return [returnData];
  }
}
