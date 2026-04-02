/**
 * Copyright (c) 2026 Velocity BPA
 * 
 * Licensed under the Business Source License 1.1 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 * 
 *     https://github.com/VelocityBPA/n8n-nodes-celo/blob/main/LICENSE
 * 
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

import {
  IExecuteFunctions,
  INodeExecutionData,
  INodeType,
  INodeTypeDescription,
  NodeOperationError,
  NodeApiError,
} from 'n8n-workflow';

import { Web3 } from 'web3';
import { createHash, randomBytes } from 'crypto';

export class Celo implements INodeType {
  description: INodeTypeDescription = {
    displayName: 'Celo',
    name: 'celo',
    icon: 'file:celo.svg',
    group: ['transform'],
    version: 1,
    subtitle: '={{$parameter["operation"] + ": " + $parameter["resource"]}}',
    description: 'Interact with the Celo API',
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
      // Resource selector
      {
        displayName: 'Resource',
        name: 'resource',
        type: 'options',
        noDataExpression: true,
        options: [
          {
            name: 'Account',
            value: 'account',
          },
          {
            name: 'Transaction',
            value: 'transaction',
          },
          {
            name: 'Block',
            value: 'block',
          },
          {
            name: 'Validator',
            value: 'validator',
          },
          {
            name: 'Governance',
            value: 'governance',
          },
          {
            name: 'StableCoin',
            value: 'stableCoin',
          },
          {
            name: 'Identity',
            value: 'identity',
          },
          {
            name: 'Accounts',
            value: 'accounts',
          },
          {
            name: 'StableTokens',
            value: 'stableTokens',
          },
          {
            name: 'ValidatorStaking',
            value: 'validatorStaking',
          },
          {
            name: 'Exchange',
            value: 'exchange',
          }
        ],
        default: 'account',
      },
      // Operation dropdowns per resource
{
	displayName: 'Operation',
	name: 'operation',
	type: 'options',
	noDataExpression: true,
	displayOptions: {
		show: {
			resource: ['account'],
		},
	},
	options: [
		{
			name: 'Get Balance',
			value: 'getBalance',
			description: 'Get account balance for CELO or cToken',
			action: 'Get account balance',
		},
		{
			name: 'Get Transaction Count',
			value: 'getTransactionCount',
			description: 'Get transaction count (nonce) for account',
			action: 'Get transaction count',
		},
		{
			name: 'Get Code',
			value: 'getCode',
			description: 'Get contract code at address',
			action: 'Get contract code',
		},
		{
			name: 'List Accounts',
			value: 'listAccounts',
			description: 'List available accounts',
			action: 'List accounts',
		},
		{
			name: 'Call Contract',
			value: 'callContract',
			description: 'Execute contract call without creating transaction',
			action: 'Call contract',
		},
	],
	default: 'getBalance',
},
{
	displayName: 'Operation',
	name: 'operation',
	type: 'options',
	noDataExpression: true,
	displayOptions: {
		show: {
			resource: ['transaction'],
		},
	},
	options: [
		{
			name: 'Send Transaction',
			value: 'sendTransaction',
			description: 'Send a transaction to the Celo network',
			action: 'Send transaction',
		},
		{
			name: 'Send Raw Transaction',
			value: 'sendRawTransaction',
			description: 'Send a signed raw transaction',
			action: 'Send raw transaction',
		},
		{
			name: 'Get Transaction',
			value: 'getTransaction',
			description: 'Get transaction details by hash',
			action: 'Get transaction',
		},
		{
			name: 'Get Transaction by Hash',
			value: 'getTransactionByHash',
			description: 'Get transaction by hash',
			action: 'Get transaction by hash',
		},
		{
			name: 'Get Transaction Receipt',
			value: 'getTransactionReceipt',
			description: 'Get transaction receipt',
			action: 'Get transaction receipt',
		},
		{
			name: 'Estimate Gas',
			value: 'estimateGas',
			description: 'Estimate gas required for transaction',
			action: 'Estimate gas',
		},
		{
			name: 'Get Gas Price',
			value: 'getGasPrice',
			description: 'Get current gas price',
			action: 'Get gas price',
		},
	],
	default: 'sendTransaction',
},
{
  displayName: 'Operation',
  name: 'operation',
  type: 'options',
  noDataExpression: true,
  displayOptions: { show: { resource: ['block'] } },
  options: [
    { name: 'Get Block by Number', value: 'getBlockByNumber', description: 'Get block by number', action: 'Get block by number' },
    { name: 'Get Block by Hash', value: 'getBlockByHash', description: 'Get block by hash', action: 'Get block by hash' },
    { name: 'Get Latest Block Number', value: 'getLatestBlock', description: 'Get latest block number', action: 'Get latest block number' },
    { name: 'Get Block Transaction Count', value: 'getBlockTransactionCount', description: 'Get transaction count in block', action: 'Get block transaction count' },
    { name: 'Get Uncle Block Information', value: 'getUncle', description: 'Get uncle block information', action: 'Get uncle block information' }
  ],
  default: 'getBlockByNumber',
},
{
  displayName: 'Operation',
  name: 'operation',
  type: 'options',
  noDataExpression: true,
  displayOptions: { show: { resource: ['validator'] } },
  options: [
    { name: 'Get Validators', value: 'getValidators', description: 'Get list of active validators', action: 'Get validators' },
    { name: 'Get Validator Group', value: 'getValidatorGroup', description: 'Get validator group information', action: 'Get validator group' },
    { name: 'Get Votes For Validator Group', value: 'getVotesForValidatorGroup', description: 'Get votes for validator group', action: 'Get votes for validator group' },
    { name: 'Is Validator', value: 'isValidator', description: 'Check if address is a validator', action: 'Check if validator' },
    { name: 'Get Validator Rewards', value: 'getValidatorRewards', description: 'Get validator rewards information', action: 'Get validator rewards' },
  ],
  default: 'getValidators',
},
{
  displayName: 'Operation',
  name: 'operation',
  type: 'options',
  noDataExpression: true,
  displayOptions: { show: { resource: ['governance'] } },
  options: [
    { name: 'Get Proposals', value: 'getProposals', description: 'Get governance proposals', action: 'Get governance proposals' },
    { name: 'Get Proposal', value: 'getProposal', description: 'Get specific proposal details', action: 'Get specific proposal details' },
    { name: 'Get Votes', value: 'getVotes', description: 'Get votes for proposal', action: 'Get votes for proposal' },
    { name: 'Is Voting', value: 'isVoting', description: 'Check voting status', action: 'Check voting status' },
    { name: 'Vote', value: 'vote', description: 'Vote on governance proposal', action: 'Vote on governance proposal' },
    {
      name: 'Propose',
      value: 'propose',
      description: 'Submit a governance proposal',
      action: 'Submit governance proposal',
    },
    {
      name: 'Execute',
      value: 'execute',
      description: 'Execute approved proposal',
      action: 'Execute approved proposal',
    },
    {
      name: 'Get Vote Record',
      value: 'getVoteRecord',
      description: 'Get voting record for address',
      action: 'Get voting record',
    },
    {
      name: 'Get Queue',
      value: 'getQueue',
      description: 'Get queued proposals',
      action: 'Get queued proposals',
    },
    {
      name: 'Upvote',
      value: 'upvote',
      description: 'Upvote proposal in queue',
      action: 'Upvote proposal in queue',
    },
  ],
  default: 'getProposals',
},
{
  displayName: 'Operation',
  name: 'operation',
  type: 'options',
  noDataExpression: true,
  displayOptions: { show: { resource: ['stableCoin'] } },
  options: [
    { name: 'Get StableCoin Balance', value: 'getStableCoinBalance', description: 'Get stablecoin balance', action: 'Get stablecoin balance' },
    { name: 'Get Exchange Rate', value: 'getExchangeRate', description: 'Get exchange rate between CELO and stablecoins', action: 'Get exchange rate' },
    { name: 'Mint StableCoin', value: 'mintStableCoin', description: 'Mint stablecoins through Mento', action: 'Mint stablecoin' },
    { name: 'Burn StableCoin', value: 'burnStableCoin', description: 'Burn stablecoins', action: 'Burn stablecoin' },
    { name: 'Get StableCoin Supply', value: 'getStableCoinSupply', description: 'Get total supply of stablecoin', action: 'Get stablecoin supply' },
    { name: 'Transfer StableCoin', value: 'transferStableCoin', description: 'Transfer stablecoins', action: 'Transfer stablecoin' }
  ],
  default: 'getStableCoinBalance',
},
{
  displayName: 'Operation',
  name: 'operation',
  type: 'options',
  noDataExpression: true,
  displayOptions: { show: { resource: ['identity'] } },
  options: [
    { name: 'Get Attestations', value: 'getAttestations', description: 'Get attestation status for identifier', action: 'Get attestations' },
    { name: 'Get Identifier Status', value: 'getIdentifierStatus', description: 'Check verification status of phone/email', action: 'Get identifier status' },
    { name: 'Request Attestation', value: 'requestAttestation', description: 'Request identity attestation', action: 'Request attestation' },
    { name: 'Complete Attestation', value: 'completeAttestation', description: 'Complete attestation process', action: 'Complete attestation' },
    { name: 'Get Attestation Issuers', value: 'getAttestationIssuers', description: 'Get list of attestation issuers', action: 'Get attestation issuers' },
    {
      name: 'Request Attestations',
      value: 'requestAttestations',
      description: 'Request phone number attestations',
      action: 'Request phone number attestations',
    },
    {
      name: 'Select Issuers',
      value: 'selectIssuers',
      description: 'Select attestation issuers',
      action: 'Select attestation issuers',
    },
    {
      name: 'Complete Attestations',
      value: 'completeAttestations',
      description: 'Complete attestation process',
      action: 'Complete attestation process',
    },
    {
      name: 'Get Account Metadata',
      value: 'getAccountMetadata',
      description: 'Get account metadata claims',
      action: 'Get account metadata claims',
    },
    {
      name: 'Set Account Metadata',
      value: 'setAccountMetadata',
      description: 'Set account metadata',
      action: 'Set account metadata',
    },
  ],
  default: 'getAttestations',
},
{
  displayName: 'Operation',
  name: 'operation',
  type: 'options',
  noDataExpression: true,
  displayOptions: {
    show: {
      resource: ['accounts'],
    },
  },
  options: [
    {
      name: 'Get Balance',
      value: 'getBalance',
      description: 'Get account balance for CELO, cUSD, cEUR tokens',
      action: 'Get account balance',
    },
    {
      name: 'Get Account Summary',
      value: 'getAccountSummary',
      description: 'Get comprehensive account information',
      action: 'Get account summary',
    },
    {
      name: 'Get Code',
      value: 'getCode',
      description: 'Get contract code at address',
      action: 'Get contract code',
    },
    {
      name: 'Get Transaction Count',
      value: 'getTransactionCount',
      description: 'Get nonce for account',
      action: 'Get transaction count',
    },
    {
      name: 'Create Account',
      value: 'createAccount',
      description: 'Generate new account keypair',
      action: 'Create new account',
    },
  ],
  default: 'getBalance',
},
{
  displayName: 'Operation',
  name: 'operation',
  type: 'options',
  noDataExpression: true,
  displayOptions: {
    show: {
      resource: ['stableTokens'],
    },
  },
  options: [
    {
      name: 'Transfer',
      value: 'transfer',
      description: 'Transfer stablecoins between accounts',
      action: 'Transfer stablecoins',
    },
    {
      name: 'Approve',
      value: 'approve',
      description: 'Approve spending allowance',
      action: 'Approve spending',
    },
    {
      name: 'Get Allowance',
      value: 'allowance',
      description: 'Check spending allowance',
      action: 'Get allowance',
    },
    {
      name: 'Get Balance',
      value: 'balanceOf',
      description: 'Get token balance',
      action: 'Get balance',
    },
    {
      name: 'Get Total Supply',
      value: 'totalSupply',
      description: 'Get total token supply',
      action: 'Get total supply',
    },
    {
      name: 'Get Token Info',
      value: 'getTokenInfo',
      description: 'Get token metadata',
      action: 'Get token info',
    },
  ],
  default: 'transfer',
},
{
  displayName: 'Operation',
  name: 'operation',
  type: 'options',
  noDataExpression: true,
  displayOptions: {
    show: {
      resource: ['validatorStaking'],
    },
  },
  options: [
    {
      name: 'Vote',
      value: 'vote',
      description: 'Vote for validator group',
      action: 'Vote for validator group',
    },
    {
      name: 'Activate',
      value: 'activate',
      description: 'Activate pending votes',
      action: 'Activate pending votes',
    },
    {
      name: 'Revoke',
      value: 'revoke',
      description: 'Revoke votes',
      action: 'Revoke votes',
    },
    {
      name: 'Get Votes For Group',
      value: 'getVotesForGroup',
      description: 'Get votes for validator group',
      action: 'Get votes for validator group',
    },
    {
      name: 'Get Elected Validators',
      value: 'getElectedValidators',
      description: 'Get currently elected validators',
      action: 'Get currently elected validators',
    },
    {
      name: 'Get Validator Groups',
      value: 'getValidatorGroups',
      description: 'Get all validator groups',
      action: 'Get all validator groups',
    },
    {
      name: 'Lock',
      value: 'lock',
      description: 'Lock CELO for voting',
      action: 'Lock CELO for voting',
    },
    {
      name: 'Unlock',
      value: 'unlock',
      description: 'Unlock CELO',
      action: 'Unlock CELO',
    },
  ],
  default: 'vote',
},
{
  displayName: 'Operation',
  name: 'operation',
  type: 'options',
  noDataExpression: true,
  displayOptions: {
    show: {
      resource: ['exchange'],
    },
  },
  options: [
    {
      name: 'Exchange',
      value: 'exchange',
      description: 'Exchange CELO for stablecoins or vice versa',
      action: 'Exchange tokens',
    },
    {
      name: 'Get Exchange Rate',
      value: 'getExchangeRate',
      description: 'Get current exchange rate between tokens',
      action: 'Get exchange rate',
    },
    {
      name: 'Get Buy Token Amount',
      value: 'getBuyTokenAmount',
      description: 'Calculate buy amount for exchange',
      action: 'Get buy token amount',
    },
    {
      name: 'Get Sell Token Amount',
      value: 'getSellTokenAmount',
      description: 'Calculate sell amount for exchange',
      action: 'Get sell token amount',
    },
    {
      name: 'Get Reserves',
      value: 'getReserves',
      description: 'Get reserve balances',
      action: 'Get reserves',
    },
    {
      name: 'Get Reserve Ratio',
      value: 'getReserveRatio',
      description: 'Get current reserve ratio',
      action: 'Get reserve ratio',
    },
  ],
  default: 'exchange',
},
      // Parameter definitions
{
	displayName: 'Address',
	name: 'address',
	type: 'string',
	required: true,
	displayOptions: {
		show: {
			resource: ['account'],
			operation: ['getBalance', 'getTransactionCount', 'getCode'],
		},
	},
	default: '',
	description: 'The account address',
},
{
	displayName: 'Block Number',
	name: 'blockNumber',
	type: 'options',
	displayOptions: {
		show: {
			resource: ['account'],
			operation: ['getBalance', 'getTransactionCount', 'getCode', 'callContract'],
		},
	},
	options: [
		{
			name: 'Latest',
			value: 'latest',
		},
		{
			name: 'Earliest',
			value: 'earliest',
		},
		{
			name: 'Pending',
			value: 'pending',
		},
		{
			name: 'Custom',
			value: 'custom',
		},
	],
	default: 'latest',
	description: 'Block parameter',
},
{
	displayName: 'Custom Block Number',
	name: 'customBlockNumber',
	type: 'string',
	displayOptions: {
		show: {
			resource: ['account'],
			operation: ['getBalance', 'getTransactionCount', 'getCode', 'callContract'],
			blockNumber: ['custom'],
		},
	},
	default: '',
	description: 'Custom block number (hex format, e.g., 0x1b4)',
},
{
	displayName: 'Transaction',
	name: 'transaction',
	type: 'json',
	required: true,
	displayOptions: {
		show: {
			resource: ['account'],
			operation: ['callContract'],
		},
	},
	default: '{}',
	description: 'Transaction object with to, data, from, gas, gasPrice, value fields',
},
{
	displayName: 'Transaction Object',
	name: 'transaction',
	type: 'json',
	displayOptions: {
		show: {
			resource: ['transaction'],
			operation: ['sendTransaction'],
		},
	},
	default: '{}',
	description: 'Transaction object with to, value, data, gas, gasPrice fields',
	required: true,
},
{
	displayName: 'Raw Transaction Data',
	name: 'data',
	type: 'string',
	displayOptions: {
		show: {
			resource: ['transaction'],
			operation: ['sendRawTransaction'],
		},
	},
	default: '',
	description: 'Signed raw transaction data',
	required: true,
},
{
	displayName: 'Transaction Hash',
	name: 'transactionHash',
	type: 'string',
	displayOptions: {
		show: {
			resource: ['transaction'],
			operation: ['getTransaction', 'getTransactionReceipt'],
		},
	},
	default: '',
	description: 'Transaction hash to query',
	required: true,
},
{
	displayName: 'Hash',
	name: 'hash',
	type: 'string',
	displayOptions: {
		show: {
			resource: ['transaction'],
			operation: ['getTransactionByHash'],
		},
	},
	default: '',
	description: 'Transaction hash to query',
	required: true,
},
{
	displayName: 'Transaction Object',
	name: 'transaction',
	type: 'json',
	displayOptions: {
		show: {
			resource: ['transaction'],
			operation: ['estimateGas'],
		},
	},
	default: '{}',
	description: 'Transaction object to estimate gas for',
	required: true,
},
{
  displayName: 'Block Number',
  name: 'blockNumber',
  type: 'string',
  required: true,
  displayOptions: {
    show: {
      resource: ['block'],
      operation: ['getBlockByNumber']
    }
  },
  default: 'latest',
  description: 'The block number in hex format or "latest", "earliest", "pending"'
},
{
  displayName: 'Full Transactions',
  name: 'fullTransactions',
  type: 'boolean',
  displayOptions: {
    show: {
      resource: ['block'],
      operation: ['getBlockByNumber']
    }
  },
  default: false,
  description: 'Whether to return full transaction objects or just hashes'
},
{
  displayName: 'Block Hash',
  name: 'blockHash',
  type: 'string',
  required: true,
  displayOptions: {
    show: {
      resource: ['block'],
      operation: ['getBlockByHash']
    }
  },
  default: '',
  description: 'The hash of the block'
},
{
  displayName: 'Full Transactions',
  name: 'fullTransactions',
  type: 'boolean',
  displayOptions: {
    show: {
      resource: ['block'],
      operation: ['getBlockByHash']
    }
  },
  default: false,
  description: 'Whether to return full transaction objects or just hashes'
},
{
  displayName: 'Block Hash',
  name: 'blockHash',
  type: 'string',
  required: true,
  displayOptions: {
    show: {
      resource: ['block'],
      operation: ['getBlockTransactionCount']
    }
  },
  default: '',
  description: 'The hash of the block'
},
{
  displayName: 'Block Hash',
  name: 'blockHash',
  type: 'string',
  required: true,
  displayOptions: {
    show: {
      resource: ['block'],
      operation: ['getUncle']
    }
  },
  default: '',
  description: 'The hash of the block'
},
{
  displayName: 'Index',
  name: 'index',
  type: 'string',
  required: true,
  displayOptions: {
    show: {
      resource: ['block'],
      operation: ['getUncle']
    }
  },
  default: '0x0',
  description: 'The uncle index position in hex format'
},
{
  displayName: 'Contract Call Data',
  name: 'contractCall',
  type: 'string',
  required: true,
  displayOptions: { 
    show: { 
      resource: ['validator'], 
      operation: ['getValidators', 'getValidatorGroup', 'getVotesForValidatorGroup', 'isValidator', 'getValidatorRewards'] 
    } 
  },
  default: '',
  description: 'Encoded contract call data',
},
{
  displayName: 'Block Number',
  name: 'blockNumber',
  type: 'string',
  displayOptions: { 
    show: { 
      resource: ['validator'], 
      operation: ['getValidators', 'getValidatorGroup', 'getVotesForValidatorGroup', 'isValidator', 'getValidatorRewards'] 
    } 
  },
  default: 'latest',
  description: 'Block number to query (latest, earliest, pending, or hex number)',
},
{
  displayName: 'To Address',
  name: 'toAddress',
  type: 'string',
  required: true,
  displayOptions: { 
    show: { 
      resource: ['validator'], 
      operation: ['getValidators', 'getValidatorGroup', 'getVotesForValidatorGroup', 'isValidator', 'getValidatorRewards'] 
    } 
  },
  default: '',
  description: 'Contract address to call',
},
{
  displayName: 'Validator Address',
  name: 'validatorAddress',
  type: 'string',
  displayOptions: { 
    show: { 
      resource: ['validator'], 
      operation: ['getValidatorGroup', 'isValidator'] 
    } 
  },
  default: '',
  description: 'Address of the validator to query',
},
{
  displayName: 'Group Address',
  name: 'groupAddress',
  type: 'string',
  displayOptions: { 
    show: { 
      resource: ['validator'], 
      operation: ['getVotesForValidatorGroup'] 
    } 
  },
  default: '',
  description: 'Address of the validator group to query votes for',
},
{
  displayName: 'Contract Call',
  name: 'contractCall',
  type: 'json',
  required: true,
  default: '{}',
  displayOptions: {
    show: {
      resource: ['governance'],
      operation: ['getProposals', 'getProposal', 'getVotes', 'isVoting'],
    },
  },
  description: 'Contract call parameters including to, data, and from addresses',
},
{
  displayName: 'Block Number',
  name: 'blockNumber',
  type: 'string',
  default: 'latest',
  displayOptions: {
    show: {
      resource: ['governance'],
      operation: ['getProposals', 'getProposal', 'getVotes', 'isVoting'],
    },
  },
  description: 'Block number or "latest" for the most recent block',
},
{
  displayName: 'Transaction',
  name: 'transaction',
  type: 'json',
  required: true,
  default: '{}',
  displayOptions: {
    show: {
      resource: ['governance'],
      operation: ['vote'],
    },
  },
  description: 'Transaction parameters including to, data, from, gas, and gasPrice',
},
{
  displayName: 'Network',
  name: 'network',
  type: 'options',
  options: [
    { name: 'Mainnet', value: 'mainnet' },
    { name: 'Alfajores Testnet', value: 'alfajores' },
  ],
  default: 'mainnet',
  displayOptions: {
    show: {
      resource: ['governance'],
    },
  },
  description: 'Celo network to use',
},
{
  displayName: 'Contract Call',
  name: 'contractCall',
  type: 'json',
  required: true,
  displayOptions: { show: { resource: ['stableCoin'], operation: ['getStableCoinBalance'] } },
  default: '{"to":"","data":""}',
  description: 'Contract call parameters for balance query'
},
{
  displayName: 'Block Number',
  name: 'blockNumber',
  type: 'string',
  required: false,
  displayOptions: { show: { resource: ['stableCoin'], operation: ['getStableCoinBalance'] } },
  default: 'latest',
  description: 'Block number to query (latest, pending, or hex number)'
},
{
  displayName: 'Contract Call',
  name: 'contractCall',
  type: 'json',
  required: true,
  displayOptions: { show: { resource: ['stableCoin'], operation: ['getExchangeRate'] } },
  default: '{"to":"","data":""}',
  description: 'Contract call parameters for exchange rate query'
},
{
  displayName: 'Block Number',
  name: 'blockNumber',
  type: 'string',
  required: false,
  displayOptions: { show: { resource: ['stableCoin'], operation: ['getExchangeRate'] } },
  default: 'latest',
  description: 'Block number to query (latest, pending, or hex number)'
},
{
  displayName: 'Transaction',
  name: 'transaction',
  type: 'json',
  required: true,
  displayOptions: { show: { resource: ['stableCoin'], operation: ['mintStableCoin'] } },
  default: '{"from":"","to":"","data":"","gas":"","gasPrice":""}',
  description: 'Transaction parameters for minting stablecoins'
},
{
  displayName: 'Transaction',
  name: 'transaction',
  type: 'json',
  required: true,
  displayOptions: { show: { resource: ['stableCoin'], operation: ['burnStableCoin'] } },
  default: '{"from":"","to":"","data":"","gas":"","gasPrice":""}',
  description: 'Transaction parameters for burning stablecoins'
},
{
  displayName: 'Contract Call',
  name: 'contractCall',
  type: 'json',
  required: true,
  displayOptions: { show: { resource: ['stableCoin'], operation: ['getStableCoinSupply'] } },
  default: '{"to":"","data":""}',
  description: 'Contract call parameters for supply query'
},
{
  displayName: 'Block Number',
  name: 'blockNumber',
  type: 'string',
  required: false,
  displayOptions: { show: { resource: ['stableCoin'], operation: ['getStableCoinSupply'] } },
  default: 'latest',
  description: 'Block number to query (latest, pending, or hex number)'
},
{
  displayName: 'Transaction',
  name: 'transaction',
  type: 'json',
  required: true,
  displayOptions: { show: { resource: ['stableCoin'], operation: ['transferStableCoin'] } },
  default: '{"from":"","to":"","data":"","gas":"","gasPrice":""}',
  description: 'Transaction parameters for transferring stablecoins'
},
{
  displayName: 'Contract Call',
  name: 'contractCall',
  type: 'json',
  required: true,
  displayOptions: { show: { resource: ['identity'], operation: ['getAttestations', 'getIdentifierStatus', 'getAttestationIssuers'] } },
  default: '{}',
  description: 'The contract call parameters for the JSON-RPC request',
  placeholder: '{"to": "0x...", "data": "0x..."}',
},
{
  displayName: 'Block Number',
  name: 'blockNumber',
  type: 'string',
  displayOptions: { show: { resource: ['identity'], operation: ['getAttestations', 'getIdentifierStatus', 'getAttestationIssuers'] } },
  default: 'latest',
  description: 'Block number to query. Use "latest" for most recent block.',
},
{
  displayName: 'Transaction',
  name: 'transaction',
  type: 'json',
  required: true,
  displayOptions: { show: { resource: ['identity'], operation: ['requestAttestation', 'completeAttestation'] } },
  default: '{}',
  description: 'The transaction parameters for sending to the network',
  placeholder: '{"from": "0x...", "to": "0x...", "data": "0x...", "value": "0x0"}',
},
{
  displayName: 'Network',
  name: 'network',
  type: 'options',
  displayOptions: { show: { resource: ['identity'] } },
  options: [
    { name: 'Mainnet', value: 'mainnet' },
    { name: 'Alfajores Testnet', value: 'alfajores' },
  ],
  default: 'mainnet',
  description: 'The Celo network to use',
},
{
  displayName: 'Gas Limit',
  name: 'gasLimit',
  type: 'string',
  displayOptions: { show: { resource: ['identity'], operation: ['requestAttestation', 'completeAttestation'] } },
  default: '',
  description: 'Gas limit for the transaction (optional, will estimate if not provided)',
},
{
  displayName: 'Gas Price',
  name: 'gasPrice',
  type: 'string',
  displayOptions: { show: { resource: ['identity'], operation: ['requestAttestation', 'completeAttestation'] } },
  default: '',
  description: 'Gas price for the transaction (optional)',
},
{
  displayName: 'Address',
  name: 'address',
  type: 'string',
  required: true,
  displayOptions: {
    show: {
      resource: ['accounts'],
      operation: ['getBalance', 'getAccountSummary', 'getCode', 'getTransactionCount'],
    },
  },
  default: '',
  description: 'The account address to query',
},
{
  displayName: 'Block Number',
  name: 'blockNumber',
  type: 'string',
  displayOptions: {
    show: {
      resource: ['accounts'],
      operation: ['getBalance', 'getCode', 'getTransactionCount'],
    },
  },
  default: 'latest',
  description: 'Block number as hex string or block tag (latest, earliest, pending)',
},
{
  displayName: 'Token Contracts',
  name: 'tokenContracts',
  type: 'multiOptions',
  displayOptions: {
    show: {
      resource: ['accounts'],
      operation: ['getBalance'],
    },
  },
  options: [
    {
      name: 'CELO',
      value: 'celo',
    },
    {
      name: 'cUSD',
      value: 'cusd',
    },
    {
      name: 'cEUR',
      value: 'ceur',
    },
  ],
  default: ['celo'],
  description: 'Select which token balances to retrieve',
},
{
  displayName: 'Token Address',
  name: 'tokenAddress',
  type: 'string',
  required: true,
  displayOptions: {
    show: {
      resource: ['stableTokens'],
      operation: ['transfer', 'approve', 'allowance', 'balanceOf', 'totalSupply', 'getTokenInfo'],
    },
  },
  default: '',
  description: 'The address of the stable token contract',
  placeholder: '0x765DE816845861e75A25fCA122bb6898B8B1282a',
},
{
  displayName: 'To Address',
  name: 'to',
  type: 'string',
  required: true,
  displayOptions: {
    show: {
      resource: ['stableTokens'],
      operation: ['transfer'],
    },
  },
  default: '',
  description: 'The recipient address',
  placeholder: '0x...',
},
{
  displayName: 'Value',
  name: 'value',
  type: 'string',
  required: true,
  displayOptions: {
    show: {
      resource: ['stableTokens'],
      operation: ['transfer', 'approve'],
    },
  },
  default: '',
  description: 'The amount to transfer or approve (in smallest unit)',
  placeholder: '1000000000000000000',
},
{
  displayName: 'Private Key',
  name: 'privateKey',
  type: 'string',
  required: true,
  displayOptions: {
    show: {
      resource: ['stableTokens'],
      operation: ['transfer', 'approve'],
    },
  },
  default: '',
  description: 'The private key for signing the transaction',
  placeholder: '0x...',
  typeOptions: {
    password: true,
  },
},
{
  displayName: 'Spender Address',
  name: 'spender',
  type: 'string',
  required: true,
  displayOptions: {
    show: {
      resource: ['stableTokens'],
      operation: ['approve', 'allowance'],
    },
  },
  default: '',
  description: 'The address allowed to spend tokens',
  placeholder: '0x...',
},
{
  displayName: 'Owner Address',
  name: 'owner',
  type: 'string',
  required: true,
  displayOptions: {
    show: {
      resource: ['stableTokens'],
      operation: ['allowance'],
    },
  },
  default: '',
  description: 'The owner of the tokens',
  placeholder: '0x...',
},
{
  displayName: 'Account Address',
  name: 'address',
  type: 'string',
  required: true,
  displayOptions: {
    show: {
      resource: ['stableTokens'],
      operation: ['balanceOf'],
    },
  },
  default: '',
  description: 'The account address to check balance',
  placeholder: '0x...',
},
{
  displayName: 'Gas Limit',
  name: 'gasLimit',
  type: 'number',
  required: false,
  displayOptions: {
    show: {
      resource: ['stableTokens'],
      operation: ['transfer', 'approve'],
    },
  },
  default: 100000,
  description: 'Gas limit for the transaction',
},
{
  displayName: 'Gas Price',
  name: 'gasPrice',
  type: 'string',
  required: false,
  displayOptions: {
    show: {
      resource: ['stableTokens'],
      operation: ['transfer', 'approve'],
    },
  },
  default: '',
  description: 'Gas price in wei (leave empty for automatic)',
  placeholder: '1000000000',
},
{
  displayName: 'Phone Number',
  name: 'phoneNumber',
  type: 'string',
  required: true,
  displayOptions: {
    show: {
      resource: ['identity'],
      operation: ['requestAttestations'],
    },
  },
  default: '',
  description: 'The phone number to request attestations for',
},
{
  displayName: 'Attestations Requested',
  name: 'attestationsRequested',
  type: 'number',
  required: true,
  displayOptions: {
    show: {
      resource: ['identity'],
      operation: ['requestAttestations'],
    },
  },
  default: 1,
  description: 'The number of attestations to request',
},
{
  displayName: 'Private Key',
  name: 'privateKey',
  type: 'string',
  required: true,
  displayOptions: {
    show: {
      resource: ['identity'],
      operation: ['requestAttestations'],
    },
  },
  default: '',
  description: 'Private key for signing the transaction',
  typeOptions: {
    password: true,
  },
},
{
  displayName: 'Phone Number',
  name: 'phoneNumber',
  type: 'string',
  required: true,
  displayOptions: {
    show: {
      resource: ['identity'],
      operation: ['selectIssuers'],
    },
  },
  default: '',
  description: 'The phone number to select issuers for',
},
{
  displayName: 'Attestations Requested',
  name: 'attestationsRequested',
  type: 'number',
  required: true,
  displayOptions: {
    show: {
      resource: ['identity'],
      operation: ['selectIssuers'],
    },
  },
  default: 1,
  description: 'The number of attestations requested',
},
{
  displayName: 'Phone Number',
  name: 'phoneNumber',
  type: 'string',
  required: true,
  displayOptions: {
    show: {
      resource: ['identity'],
      operation: ['completeAttestations'],
    },
  },
  default: '',
  description: 'The phone number to complete attestations for',
},
{
  displayName: 'Attestation Code',
  name: 'attestationCode',
  type: 'string',
  required: true,
  displayOptions: {
    show: {
      resource: ['identity'],
      operation: ['completeAttestations'],
    },
  },
  default: '',
  description: 'The attestation code received via SMS',
},
{
  displayName: 'Phone Number',
  name: 'phoneNumber',
  type: 'string',
  required: true,
  displayOptions: {
    show: {
      resource: ['identity'],
      operation: ['getAttestations'],
    },
  },
  default: '',
  description: 'The phone number to get attestations for',
},
{
  displayName: 'Address',
  name: 'address',
  type: 'string',
  required: true,
  displayOptions: {
    show: {
      resource: ['identity'],
      operation: ['getAttestations'],
    },
  },
  default: '',
  description: 'The account address to check attestations for',
},
{
  displayName: 'Address',
  name: 'address',
  type: 'string',
  required: true,
  displayOptions: {
    show: {
      resource: ['identity'],
      operation: ['getAccountMetadata'],
    },
  },
  default: '',
  description: 'The account address to get metadata for',
},
{
  displayName: 'Metadata URL',
  name: 'metadataURL',
  type: 'string',
  required: true,
  displayOptions: {
    show: {
      resource: ['identity'],
      operation: ['setAccountMetadata'],
    },
  },
  default: '',
  description: 'The URL containing the account metadata',
},
{
  displayName: 'Private Key',
  name: 'privateKey',
  type: 'string',
  required: true,
  displayOptions: {
    show: {
      resource: ['identity'],
      operation: ['setAccountMetadata'],
    },
  },
  default: '',
  description: 'Private key for signing the transaction',
  typeOptions: {
    password: true,
  },
},
{
  displayName: 'Group Address',
  name: 'group',
  type: 'string',
  required: true,
  displayOptions: {
    show: {
      resource: ['validatorStaking'],
      operation: ['vote', 'activate', 'revoke', 'getVotesForGroup'],
    },
  },
  default: '',
  description: 'The validator group address',
},
{
  displayName: 'Value',
  name: 'value',
  type: 'string',
  required: true,
  displayOptions: {
    show: {
      resource: ['validatorStaking'],
      operation: ['vote', 'revoke', 'lock', 'unlock'],
    },
  },
  default: '',
  description: 'The amount in wei (for vote/revoke/lock/unlock operations)',
},
{
  displayName: 'Private Key',
  name: 'privateKey',
  type: 'string',
  required: true,
  typeOptions: {
    password: true,
  },
  displayOptions: {
    show: {
      resource: ['validatorStaking'],
      operation: ['vote', 'activate', 'revoke', 'lock', 'unlock'],
    },
  },
  default: '',
  description: 'The private key for signing the transaction',
},
{
  displayName: 'Voter Address',
  name: 'voter',
  type: 'string',
  required: true,
  displayOptions: {
    show: {
      resource: ['validatorStaking'],
      operation: ['getVotesForGroup'],
    },
  },
  default: '',
  description: 'The voter address',
},
{
  displayName: 'Values',
  name: 'values',
  type: 'json',
  required: true,
  displayOptions: {
    show: {
      resource: ['governance'],
      operation: ['propose'],
    },
  },
  default: '',
  description: 'Array of values to be passed to the proposal',
},
{
  displayName: 'Destinations',
  name: 'destinations',
  type: 'json',
  required: true,
  displayOptions: {
    show: {
      resource: ['governance'],
      operation: ['propose'],
    },
  },
  default: '',
  description: 'Array of destination addresses for the proposal',
},
{
  displayName: 'Data',
  name: 'data',
  type: 'json',
  required: true,
  displayOptions: {
    show: {
      resource: ['governance'],
      operation: ['propose'],
    },
  },
  default: '',
  description: 'Array of data to be passed to the proposal',
},
{
  displayName: 'Description URL',
  name: 'descriptionURL',
  type: 'string',
  required: true,
  displayOptions: {
    show: {
      resource: ['governance'],
      operation: ['propose'],
    },
  },
  default: '',
  description: 'URL containing the proposal description',
},
{
  displayName: 'Private Key',
  name: 'privateKey',
  type: 'string',
  required: true,
  displayOptions: {
    show: {
      resource: ['governance'],
      operation: ['propose', 'execute', 'upvote'],
    },
  },
  default: '',
  description: 'Private key for signing the transaction',
  typeOptions: {
    password: true,
  },
},
{
  displayName: 'Proposal ID',
  name: 'proposalId',
  type: 'string',
  required: true,
  displayOptions: {
    show: {
      resource: ['governance'],
      operation: ['getProposal', 'execute', 'getVoteRecord', 'upvote'],
    },
  },
  default: '',
  description: 'The ID of the proposal',
},
{
  displayName: 'Vote',
  name: 'vote',
  type: 'options',
  required: true,
  displayOptions: {
    show: {
      resource: ['governance'],
      operation: ['vote'],
    },
  },
  options: [
    {
      name: 'Yes',
      value: '1',
    },
    {
      name: 'No',
      value: '0',
    },
    {
      name: 'Abstain',
      value: '2',
    },
  ],
  default: '1',
  description: 'The vote choice',
},
{
  displayName: 'Address',
  name: 'address',
  type: 'string',
  required: true,
  displayOptions: {
    show: {
      resource: ['governance'],
      operation: ['getVoteRecord'],
    },
  },
  default: '',
  description: 'The address to check voting record for',
},
{
  displayName: 'Sell Amount',
  name: 'sellAmount',
  type: 'string',
  required: true,
  displayOptions: {
    show: {
      resource: ['exchange'],
      operation: ['exchange'],
    },
  },
  default: '',
  description: 'Amount of tokens to sell (in wei)',
},
{
  displayName: 'Minimum Buy Amount',
  name: 'minBuyAmount',
  type: 'string',
  required: true,
  displayOptions: {
    show: {
      resource: ['exchange'],
      operation: ['exchange'],
    },
  },
  default: '',
  description: 'Minimum amount of tokens to receive (in wei)',
},
{
  displayName: 'Sell Token',
  name: 'sellToken',
  type: 'options',
  required: true,
  displayOptions: {
    show: {
      resource: ['exchange'],
      operation: ['exchange', 'getExchangeRate', 'getBuyTokenAmount', 'getSellTokenAmount'],
    },
  },
  options: [
    {
      name: 'CELO',
      value: 'CELO',
    },
    {
      name: 'cUSD',
      value: 'cUSD',
    },
    {
      name: 'cEUR',
      value: 'cEUR',
    },
    {
      name: 'cREAL',
      value: 'cREAL',
    },
  ],
  default: 'CELO',
  description: 'Token to sell',
},
{
  displayName: 'Buy Token',
  name: 'buyToken',
  type: 'options',
  required: true,
  displayOptions: {
    show: {
      resource: ['exchange'],
      operation: ['exchange', 'getExchangeRate', 'getBuyTokenAmount', 'getSellTokenAmount'],
    },
  },
  options: [
    {
      name: 'CELO',
      value: 'CELO',
    },
    {
      name: 'cUSD',
      value: 'cUSD',
    },
    {
      name: 'cEUR',
      value: 'cEUR',
    },
    {
      name: 'cREAL',
      value: 'cREAL',
    },
  ],
  default: 'cUSD',
  description: 'Token to buy',
},
{
  displayName: 'Private Key',
  name: 'privateKey',
  type: 'string',
  typeOptions: {
    password: true,
  },
  required: true,
  displayOptions: {
    show: {
      resource: ['exchange'],
      operation: ['exchange'],
    },
  },
  default: '',
  description: 'Private key for signing the transaction',
},
{
  displayName: 'Sell Amount',
  name: 'sellAmount',
  type: 'string',
  required: true,
  displayOptions: {
    show: {
      resource: ['exchange'],
      operation: ['getExchangeRate', 'getBuyTokenAmount'],
    },
  },
  default: '',
  description: 'Amount of tokens to sell (in wei)',
},
{
  displayName: 'Buy Amount',
  name: 'buyAmount',
  type: 'string',
  required: true,
  displayOptions: {
    show: {
      resource: ['exchange'],
      operation: ['getSellTokenAmount'],
    },
  },
  default: '',
  description: 'Amount of tokens to buy (in wei)',
},
{
  displayName: 'Token',
  name: 'token',
  type: 'options',
  required: true,
  displayOptions: {
    show: {
      resource: ['exchange'],
      operation: ['getReserveRatio'],
    },
  },
  options: [
    {
      name: 'cUSD',
      value: 'cUSD',
    },
    {
      name: 'cEUR',
      value: 'cEUR',
    },
    {
      name: 'cREAL',
      value: 'cREAL',
    },
  ],
  default: 'cUSD',
  description: 'Token to get reserve ratio for',
},
    ],
  };

  async execute(this: IExecuteFunctions): Promise<INodeExecutionData[][]> {
    const items = this.getInputData();
    const resource = this.getNodeParameter('resource', 0) as string;

    switch (resource) {
      case 'account':
        return [await executeAccountOperations.call(this, items)];
      case 'transaction':
        return [await executeTransactionOperations.call(this, items)];
      case 'block':
        return [await executeBlockOperations.call(this, items)];
      case 'validator':
        return [await executeValidatorOperations.call(this, items)];
      case 'governance':
        return [await executeGovernanceOperations.call(this, items)];
      case 'stableCoin':
        return [await executeStableCoinOperations.call(this, items)];
      case 'identity':
        return [await executeIdentityOperations.call(this, items)];
      case 'accounts':
        return [await executeAccountsOperations.call(this, items)];
      case 'stableTokens':
        return [await executeStableTokensOperations.call(this, items)];
      case 'validatorStaking':
        return [await executeValidatorStakingOperations.call(this, items)];
      case 'exchange':
        return [await executeExchangeOperations.call(this, items)];
      default:
        throw new NodeOperationError(this.getNode(), `The resource "${resource}" is not supported`);
    }
  }
}

// ============================================================
// Resource Handler Functions
// ============================================================

async function executeAccountOperations(
	this: IExecuteFunctions,
	items: INodeExecutionData[],
): Promise<INodeExecutionData[]> {
	const returnData: INodeExecutionData[] = [];
	const operation = this.getNodeParameter('operation', 0) as string;
	const credentials = await this.getCredentials('celoApi') as any;

	for (let i = 0; i < items.length; i++) {
		try {
			let result: any;
			const baseUrl = credentials.baseUrl || 'https://forno.celo.org';
			
			const headers: any = {
				'Content-Type': 'application/json',
			};

			if (credentials.apiKey) {
				headers['Authorization'] = `Bearer ${credentials.apiKey}`;
			}

			switch (operation) {
				case 'getBalance': {
					const address = this.getNodeParameter('address', i) as string;
					const blockNumber = this.getNodeParameter('blockNumber', i) as string;
					const customBlockNumber = this.getNodeParameter('customBlockNumber', i, '') as string;
					
					const blockParam = blockNumber === 'custom' ? customBlockNumber : blockNumber;

					const requestBody = {
						jsonrpc: '2.0',
						method: 'eth_getBalance',
						params: [address, blockParam],
						id: 1,
					};

					const options: any = {
						method: 'POST',
						url: baseUrl,
						headers,
						body: requestBody,
						json: true,
					};

					result = await this.helpers.httpRequest(options) as any;
					break;
				}

				case 'getTransactionCount': {
					const address = this.getNodeParameter('address', i) as string;
					const blockNumber = this.getNodeParameter('blockNumber', i) as string;
					const customBlockNumber = this.getNodeParameter('customBlockNumber', i, '') as string;
					
					const blockParam = blockNumber === 'custom' ? customBlockNumber : blockNumber;

					const requestBody = {
						jsonrpc: '2.0',
						method: 'eth_getTransactionCount',
						params: [address, blockParam],
						id: 1,
					};

					const options: any = {
						method: 'POST',
						url: baseUrl,
						headers,
						body: requestBody,
						json: true,
					};

					result = await this.helpers.httpRequest(options) as any;
					break;
				}

				case 'getCode': {
					const address = this.getNodeParameter('address', i) as string;
					const blockNumber = this.getNodeParameter('blockNumber', i) as string;
					const customBlockNumber = this.getNodeParameter('customBlockNumber', i, '') as string;
					
					const blockParam = blockNumber === 'custom' ? customBlockNumber : blockNumber;

					const requestBody = {
						jsonrpc: '2.0',
						method: 'eth_getCode',
						params: [address, blockParam],
						id: 1,
					};

					const options: any = {
						method: 'POST',
						url: baseUrl,
						headers,
						body: requestBody,
						json: true,
					};

					result = await this.helpers.httpRequest(options) as any;
					break;
				}

				case 'listAccounts': {
					const requestBody = {
						jsonrpc: '2.0',
						method: 'eth_accounts',
						params: [],
						id: 1,
					};

					const options: any = {
						method: 'POST',
						url: baseUrl,
						headers,
						body: requestBody,
						json: true,
					};

					result = await this.helpers.httpRequest(options) as any;
					break;
				}

				case 'callContract': {
					const transaction = this.getNodeParameter('transaction', i) as object;
					const blockNumber = this.getNodeParameter('blockNumber', i) as string;
					const customBlockNumber = this.getNodeParameter('customBlockNumber', i, '') as string;
					
					const blockParam = blockNumber === 'custom' ? customBlockNumber : blockNumber;

					const requestBody = {
						jsonrpc: '2.0',
						method: 'eth_call',
						params: [transaction, blockParam],
						id: 1,
					};

					const options: any = {
						method: 'POST',
						url: baseUrl,
						headers,
						body: requestBody,
						json: true,
					};

					result = await this.helpers.httpRequest(options) as any;
					break;
				}

				default:
					throw new NodeOperationError(this.getNode(), `Unknown operation: ${operation}`);
			}

			returnData.push({
				json: result,
				pairedItem: { item: i },
			});
		} catch (error: any) {
			if (this.continueOnFail()) {
				returnData.push({
					json: { error: error.message },
					pairedItem: { item: i },
				});
			} else {
				throw error;
			}
		}
	}

	return returnData;
}

async function executeTransactionOperations(
	this: IExecuteFunctions,
	items: INodeExecutionData[],
): Promise<INodeExecutionData[]> {
	const returnData: INodeExecutionData[] = [];
	const operation = this.getNodeParameter('operation', 0) as string;
	const credentials = await this.getCredentials('celoApi') as any;

	for (let i = 0; i < items.length; i++) {
		try {
			let result: any;
			
			switch (operation) {
				case 'sendTransaction': {
					const transaction = this.getNodeParameter('transaction', i) as any;
					const requestBody = {
						jsonrpc: '2.0',
						method: 'eth_sendTransaction',
						params: [transaction],
						id: 1,
					};
					
					const options: any = {
						method: 'POST',
						url: credentials.baseUrl || 'https://forno.celo.org',
						headers: {
							'Content-Type': 'application/json',
							'Authorization': `Bearer ${credentials.apiKey}`,
						},
						body: requestBody,
						json: true,
					};
					
					result = await this.helpers.httpRequest(options) as any;
					break;
				}

				case 'sendRawTransaction': {
					const data = this.getNodeParameter('data', i) as string;
					const requestBody = {
						jsonrpc: '2.0',
						method: 'eth_sendRawTransaction',
						params: [data],
						id: