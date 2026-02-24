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
            name: 'Accounts',
            value: 'accounts',
          },
          {
            name: 'StableTokens',
            value: 'stableTokens',
          },
          {
            name: 'Identity',
            value: 'identity',
          },
          {
            name: 'ValidatorStaking',
            value: 'validatorStaking',
          },
          {
            name: 'Governance',
            value: 'governance',
          },
          {
            name: 'Exchange',
            value: 'exchange',
          }
        ],
        default: 'accounts',
      },
      // Operation dropdowns per resource
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
      resource: ['identity'],
    },
  },
  options: [
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
      name: 'Get Attestations',
      value: 'getAttestations',
      description: 'Get attestation status',
      action: 'Get attestation status',
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
  default: 'requestAttestations',
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
      resource: ['governance'],
    },
  },
  options: [
    {
      name: 'Propose',
      value: 'propose',
      description: 'Submit a governance proposal',
      action: 'Submit governance proposal',
    },
    {
      name: 'Vote',
      value: 'vote',
      description: 'Vote on a governance proposal',
      action: 'Vote on governance proposal',
    },
    {
      name: 'Get Proposal',
      value: 'getProposal',
      description: 'Get proposal details',
      action: 'Get proposal details',
    },
    {
      name: 'Get Proposals',
      value: 'getProposals',
      description: 'Get all proposals with status',
      action: 'Get all proposals',
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
  default: 'propose',
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
      operation: ['propose', 'vote', 'execute', 'upvote'],
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
      operation: ['vote', 'getProposal', 'execute', 'getVoteRecord', 'upvote'],
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
      case 'accounts':
        return [await executeAccountsOperations.call(this, items)];
      case 'stableTokens':
        return [await executeStableTokensOperations.call(this, items)];
      case 'identity':
        return [await executeIdentityOperations.call(this, items)];
      case 'validatorStaking':
        return [await executeValidatorStakingOperations.call(this, items)];
      case 'governance':
        return [await executeGovernanceOperations.call(this, items)];
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

async function executeAccountsOperations(
  this: IExecuteFunctions,
  items: INodeExecutionData[],
): Promise<INodeExecutionData[]> {
  const returnData: INodeExecutionData[] = [];
  const operation = this.getNodeParameter('operation', 0) as string;
  const credentials = await this.getCredentials('celoApi') as any;

  // Token contract addresses on Celo mainnet
  const TOKEN_ADDRESSES = {
    cusd: '0x765DE816845861e75A25fCA122bb6898B8B1282a',
    ceur: '0xD8763CBa276a3738E6DE85b4b3bF5FDed6D6cA73',
  };

  function generateRpcId(): number {
    return Math.floor(Math.random() * 1000000);
  }

  function generateKeyPair(): any {
    // Simple keypair generation for demo - in production use proper crypto library
    const privateKey = '0x' + Array.from({length: 64}, () => Math.floor(Math.random() * 16).toString(16)).join('');
    const address = '0x' + Array.from({length: 40}, () => Math.floor(Math.random() * 16).toString(16)).join('');
    return { privateKey, address };
  }

  async function makeRpcCall(method: string, params: any[]): Promise<any> {
    const rpcPayload = {
      jsonrpc: '2.0',
      method: method,
      params: params,
      id: generateRpcId(),
    };

    const options: any = {
      method: 'POST',
      url: credentials.baseUrl || 'https://forno.celo.org',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(rpcPayload),
    };

    const response = await this.helpers.httpRequest(options) as any;
    
    if (response.error) {
      throw new NodeApiError(this.getNode(), response.error);
    }
    
    return response.result;
  }

  for (let i = 0; i < items.length; i++) {
    try {
      let result: any;

      switch (operation) {
        case 'getBalance': {
          const address = this.getNodeParameter('address', i) as string;
          const blockNumber = this.getNodeParameter('blockNumber', i, 'latest') as string;
          const tokenContracts = this.getNodeParameter('tokenContracts', i, ['celo']) as string[];

          const balances: any = {};

          // Get CELO balance
          if (tokenContracts.includes('celo')) {
            const celoBalance = await makeRpcCall('eth_getBalance', [address, blockNumber]);
            balances.CELO = celoBalance;
          }

          // Get cUSD balance
          if (tokenContracts.includes('cusd')) {
            const balanceOfSignature = '0x70a08231000000000000000000000000' + address.slice(2).toLowerCase();
            const cusdBalance = await makeRpcCall('eth_call', [
              {
                to: TOKEN_ADDRESSES.cusd,
                data: balanceOfSignature,
              },
              blockNumber,
            ]);
            balances.cUSD = cusdBalance;
          }

          // Get cEUR balance
          if (tokenContracts.includes('ceur')) {
            const balanceOfSignature = '0x70a08231000000000000000000000000' + address.slice(2).toLowerCase();
            const ceurBalance = await makeRpcCall('eth_call', [
              {
                to: TOKEN_ADDRESSES.ceur,
                data: balanceOfSignature,
              },
              blockNumber,
            ]);
            balances.cEUR = ceurBalance;
          }

          result = {
            address,
            blockNumber,
            balances,
          };
          break;
        }

        case 'getAccountSummary': {
          const address = this.getNodeParameter('address', i) as string;

          // Get multiple account details in parallel
          const [balance, transactionCount, code] = await Promise.all([
            makeRpcCall('eth_getBalance', [address, 'latest']),
            makeRpcCall('eth_getTransactionCount', [address, 'latest']),
            makeRpcCall('eth_getCode', [address, 'latest']),
          ]);

          // Get token balances
          const balanceOfSignature = '0x70a08231000000000000000000000000' + address.slice(2).toLowerCase();
          const [cusdBalance, ceurBalance] = await Promise.all([
            makeRpcCall('eth_call', [
              { to: TOKEN_ADDRESSES.cusd, data: balanceOfSignature },
              'latest',
            ]),
            makeRpcCall('eth_call', [
              { to: TOKEN_ADDRESSES.ceur, data: balanceOfSignature },
              'latest',
            ]),
          ]);

          result = {
            address,
            celoBalance: balance,
            cusdBalance,
            ceurBalance,
            transactionCount,
            contractCode: code,
            isContract: code !== '0x',
          };
          break;
        }

        case 'getCode': {
          const address = this.getNodeParameter('address', i) as string;
          const blockNumber = this.getNodeParameter('blockNumber', i, 'latest') as string;

          const code = await makeRpcCall('eth_getCode', [address, blockNumber]);

          result = {
            address,
            blockNumber,
            code,
            isContract: code !== '0x',
          };
          break;
        }

        case 'getTransactionCount': {
          const address = this.getNodeParameter('address', i) as string;
          const blockNumber = this.getNodeParameter('blockNumber', i, 'latest') as string;

          const transactionCount = await makeRpcCall('eth_getTransactionCount', [address, blockNumber]);

          result = {
            address,
            blockNumber,
            transactionCount,
            nonce: parseInt(transactionCount, 16),
          };
          break;
        }

        case 'createAccount': {
          const keyPair = generateKeyPair();
          
          result = {
            address: keyPair.address,
            privateKey: keyPair.privateKey,
            warning: 'This is a demo implementation. Use proper cryptographic libraries in production.',
          };
          break;
        }

        default:
          throw new NodeOperationError(this.getNode(), `Unknown operation: ${operation}`);
      }

      returnData.push({ json: result, pairedItem: { item: i } });
    } catch (error: any) {
      if (this.continueOnFail()) {
        returnData.push({ 
          json: { error: error.message }, 
          pairedItem: { item: i } 
        });
      } else {
        throw error;
      }
    }
  }

  return returnData;
}

async function executeStableTokensOperations(
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
        case 'transfer': {
          const tokenAddress = this.getNodeParameter('tokenAddress', i) as string;
          const to = this.getNodeParameter('to', i) as string;
          const value = this.getNodeParameter('value', i) as string;
          const privateKey = this.getNodeParameter('privateKey', i) as string;
          const gasLimit = this.getNodeParameter('gasLimit', i, 100000) as number;
          const gasPrice = this.getNodeParameter('gasPrice', i, '') as string;

          const web3 = new Web3();
          const account = web3.eth.accounts.privateKeyToAccount(privateKey);

          // ERC20 transfer function selector
          const transferData = web3.eth.abi.encodeFunctionCall({
            name: 'transfer',
            type: 'function',
            inputs: [
              { type: 'address', name: 'to' },
              { type: 'uint256', name: 'value' }
            ]
          }, [to, value]);

          const nonce = await this.makeJsonRpcCall('eth_getTransactionCount', [account.address, 'latest']);
          const currentGasPrice = gasPrice || await this.makeJsonRpcCall('eth_gasPrice', []);

          const txData = {
            from: account.address,
            to: tokenAddress,
            data: transferData,
            gas: `0x${gasLimit.toString(16)}`,
            gasPrice: currentGasPrice.startsWith('0x') ? currentGasPrice : `0x${parseInt(currentGasPrice).toString(16)}`,
            nonce: nonce,
            value: '0x0'
          };

          const signedTx = await web3.eth.accounts.signTransaction(txData, privateKey);
          const txHash = await this.makeJsonRpcCall('eth_sendRawTransaction', [signedTx.rawTransaction]);

          result = {
            transactionHash: txHash,
            from: account.address,
            to: to,
            value: value,
            tokenAddress: tokenAddress
          };
          break;
        }

        case 'approve': {
          const tokenAddress = this.getNodeParameter('tokenAddress', i) as string;
          const spender = this.getNodeParameter('spender', i) as string;
          const value = this.getNodeParameter('value', i) as string;
          const privateKey = this.getNodeParameter('privateKey', i) as string;
          const gasLimit = this.getNodeParameter('gasLimit', i, 100000) as number;
          const gasPrice = this.getNodeParameter('gasPrice', i, '') as string;

          const web3 = new Web3();
          const account = web3.eth.accounts.privateKeyToAccount(privateKey);

          // ERC20 approve function selector
          const approveData = web3.eth.abi.encodeFunctionCall({
            name: 'approve',
            type: 'function',
            inputs: [
              { type: 'address', name: 'spender' },
              { type: 'uint256', name: 'value' }
            ]
          }, [spender, value]);

          const nonce = await this.makeJsonRpcCall('eth_getTransactionCount', [account.address, 'latest']);
          const currentGasPrice = gasPrice || await this.makeJsonRpcCall('eth_gasPrice', []);

          const txData = {
            from: account.address,
            to: tokenAddress,
            data: approveData,
            gas: `0x${gasLimit.toString(16)}`,
            gasPrice: currentGasPrice.startsWith('0x') ? currentGasPrice : `0x${parseInt(currentGasPrice).toString(16)}`,
            nonce: nonce,
            value: '0x0'
          };

          const signedTx = await web3.eth.accounts.signTransaction(txData, privateKey);
          const txHash = await this.makeJsonRpcCall('eth_sendRawTransaction', [signedTx.rawTransaction]);

          result = {
            transactionHash: txHash,
            owner: account.address,
            spender: spender,
            value: value,
            tokenAddress: tokenAddress
          };
          break;
        }

        case 'allowance': {
          const tokenAddress = this.getNodeParameter('tokenAddress', i) as string;
          const owner = this.getNodeParameter('owner', i) as string;
          const spender = this.getNodeParameter('spender', i) as string;

          const web3 = new Web3();
          const allowanceData = web3.eth.abi.encodeFunctionCall({
            name: 'allowance',
            type: 'function',
            inputs: [
              { type: 'address', name: 'owner' },
              { type: 'address', name: 'spender' }
            ]
          }, [owner, spender]);

          const allowanceResult = await this.makeJsonRpcCall('eth_call', [{
            to: tokenAddress,
            data: allowanceData
          }, 'latest']);

          result = {
            owner: owner,
            spender: spender,
            allowance: allowanceResult,
            tokenAddress: tokenAddress
          };
          break;
        }

        case 'balanceOf': {
          const tokenAddress = this.getNodeParameter('tokenAddress', i) as string;
          const address = this.getNodeParameter('address', i) as string;

          const web3 = new Web3();
          const balanceData = web3.eth.abi.encodeFunctionCall({
            name: 'balanceOf',
            type: 'function',
            inputs: [{ type: 'address', name: 'account' }]
          }, [address]);

          const balance = await this.makeJsonRpcCall('eth_call', [{
            to: tokenAddress,
            data: balanceData
          }, 'latest']);

          result = {
            address: address,
            balance: balance,
            tokenAddress: tokenAddress
          };
          break;
        }

        case 'totalSupply': {
          const tokenAddress = this.getNodeParameter('tokenAddress', i) as string;

          const web3 = new Web3();
          const totalSupplyData = web3.eth.abi.encodeFunctionCall({
            name: 'totalSupply',
            type: 'function',
            inputs: []
          }, []);

          const totalSupply = await this.makeJsonRpcCall('eth_call', [{
            to: tokenAddress,
            data: totalSupplyData
          }, 'latest']);

          result = {
            totalSupply: totalSupply,
            tokenAddress: tokenAddress
          };
          break;
        }

        case 'getTokenInfo': {
          const tokenAddress = this.getNodeParameter('tokenAddress', i) as string;

          const web3 = new Web3();
          
          // Get name
          const nameData = web3.eth.abi.encodeFunctionCall({
            name: 'name',
            type: 'function',
            inputs: []
          }, []);

          // Get symbol
          const symbolData = web3.eth.abi.encodeFunctionCall({
            name: 'symbol',
            type: 'function',
            inputs: []
          }, []);

          // Get decimals
          const decimalsData = web3.eth.abi.encodeFunctionCall({
            name: 'decimals',
            type: 'function',
            inputs: []
          }, []);

          // Get total supply
          const totalSupplyData = web3.eth.abi.encodeFunctionCall({
            name: 'totalSupply',
            type: 'function',
            inputs: []
          }, []);

          const [name, symbol, decimals, totalSupply] = await Promise.all([
            this.makeJsonRpcCall('eth_call', [{ to: tokenAddress, data: nameData }, 'latest']),
            this.makeJsonRpcCall('eth_call', [{ to: tokenAddress, data: symbolData }, 'latest']),
            this.makeJsonRpcCall('eth_call', [{ to: tokenAddress, data: decimalsData }, 'latest']),
            this.makeJsonRpcCall('eth_call', [{ to: tokenAddress, data: totalSupplyData }, 'latest'])
          ]);

          result = {
            tokenAddress: tokenAddress,
            name: web3.utils.hexToAscii(name).replace(/\0/g, ''),
            symbol: web3.utils.hexToAscii(symbol).replace(/\0/g, ''),
            decimals: parseInt(decimals, 16),
            totalSupply: totalSupply
          };
          break;
        }

        default:
          throw new NodeOperationError(this.getNode(), `Unknown operation: ${operation}`);
      }

      returnData.push({ json: result, pairedItem: { item: i } });

    } catch (error: any) {
      if (this.continueOnFail()) {
        returnData.push({ json: { error: error.message }, pairedItem: { item: i } });
      } else {
        throw new NodeApiError(this.getNode(), error);
      }
    }
  }

  return returnData;
}

async function makeJsonRpcCall(this: IExecuteFunctions, method: string, params: any[]): Promise<any> {
  const credentials = await this.getCredentials('celoApi') as any;
  
  const options: any = {
    method: 'POST',
    url: credentials.baseUrl || 'https://forno.celo.org',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      jsonrpc: '2.0',
      id: Math.floor(Math.random() * 1000000),
      method: method,
      params: params,
    }),
    json: false,
  };

  const response = await this.helpers.httpRequest(options) as any;
  const parsedResponse = JSON.parse(response);
  
  if (parsedResponse.error) {
    throw new NodeApiError(this.getNode(), parsedResponse.error);
  }
  
  return parsedResponse.result;
}

async function executeIdentityOperations(
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
        case 'requestAttestations': {
          const phoneNumber = this.getNodeParameter('phoneNumber', i) as string;
          const attestationsRequested = this.getNodeParameter('attestationsRequested', i) as number;
          const privateKey = this.getNodeParameter('privateKey', i) as string;

          const requestBody = {
            jsonrpc: '2.0',
            method: 'eth_call',
            params: [
              {
                to: '0x8c19c95D6f1B1c13d54a66A5b4e5BfbD45f94D59', // Attestations contract
                data: '0x' + phoneNumber.replace('+', '').padStart(64, '0') + attestationsRequested.toString(16).padStart(64, '0'),
              },
              'latest',
            ],
            id: 1,
          };

          const options: any = {
            method: 'POST',
            url: credentials.baseUrl || 'https://forno.celo.org',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify(requestBody),
          };

          result = await this.helpers.httpRequest(options) as any;
          break;
        }

        case 'selectIssuers': {
          const phoneNumber = this.getNodeParameter('phoneNumber', i) as string;
          const attestationsRequested = this.getNodeParameter('attestationsRequested', i) as number;

          const requestBody = {
            jsonrpc: '2.0',
            method: 'eth_call',
            params: [
              {
                to: '0x8c19c95D6f1B1c13d54a66A5b4e5BfbD45f94D59',
                data: '0x' + phoneNumber.replace('+', '').padStart(64, '0') + attestationsRequested.toString(16).padStart(64, '0'),
              },
              'latest',
            ],
            id: 1,
          };

          const options: any = {
            method: 'POST',
            url: credentials.baseUrl || 'https://forno.celo.org',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify(requestBody),
          };

          result = await this.helpers.httpRequest(options) as any;
          break;
        }

        case 'completeAttestations': {
          const phoneNumber = this.getNodeParameter('phoneNumber', i) as string;
          const attestationCode = this.getNodeParameter('attestationCode', i) as string;

          const requestBody = {
            jsonrpc: '2.0',
            method: 'eth_call',
            params: [
              {
                to: '0x8c19c95D6f1B1c13d54a66A5b4e5BfbD45f94D59',
                data: '0x' + phoneNumber.replace('+', '').padStart(64, '0') + attestationCode.padStart(64, '0'),
              },
              'latest',
            ],
            id: 1,
          };

          const options: any = {
            method: 'POST',
            url: credentials.baseUrl || 'https://forno.celo.org',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify(requestBody),
          };

          result = await this.helpers.httpRequest(options) as any;
          break;
        }

        case 'getAttestations': {
          const phoneNumber = this.getNodeParameter('phoneNumber', i) as string;
          const address = this.getNodeParameter('address', i) as string;

          const requestBody = {
            jsonrpc: '2.0',
            method: 'eth_call',
            params: [
              {
                to: '0x8c19c95D6f1B1c13d54a66A5b4e5BfbD45f94D59',
                data: '0x' + phoneNumber.replace('+', '').padStart(64, '0') + address.replace('0x', '').padStart(64, '0'),
              },
              'latest',
            ],
            id: 1,
          };

          const options: any = {
            method: 'POST',
            url: credentials.baseUrl || 'https://forno.celo.org',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify(requestBody),
          };

          result = await this.helpers.httpRequest(options) as any;
          break;
        }

        case 'getAccountMetadata': {
          const address = this.getNodeParameter('address', i) as string;

          const requestBody = {
            jsonrpc: '2.0',
            method: 'eth_call',
            params: [
              {
                to: '0x8c19c95D6f1B1c13d54a66A5b4e5BfbD45f94D59',
                data: '0x' + address.replace('0x', '').padStart(64, '0'),
              },
              'latest',
            ],
            id: 1,
          };

          const options: any = {
            method: 'POST',
            url: credentials.baseUrl || 'https://forno.celo.org',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify(requestBody),
          };

          result = await this.helpers.httpRequest(options) as any;
          break;
        }

        case 'setAccountMetadata': {
          const metadataURL = this.getNodeParameter('metadataURL', i) as string;
          const privateKey = this.getNodeParameter('privateKey', i) as string;

          const requestBody = {
            jsonrpc: '2.0',
            method: 'eth_sendTransaction',
            params: [
              {
                to: '0x8c19c95D6f1B1c13d54a66A5b4e5BfbD45f94D59',
                data: '0x' + Buffer.from(metadataURL, 'utf8').toString('hex').padStart(64, '0'),
                gas: '0x5208',
                gasPrice: '0x9184e72a000',
              },
            ],
            id: 1,
          };

          const options: any = {
            method: 'POST',
            url: credentials.baseUrl || 'https://forno.celo.org',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify(requestBody),
          };

          result = await this.helpers.httpRequest(options) as any;
          break;
        }

        default:
          throw new NodeOperationError(this.getNode(), `Unknown operation: ${operation}`);
      }

      returnData.push({ json: result, pairedItem: { item: i } });
    } catch (error: any) {
      if (this.continueOnFail()) {
        returnData.push({ json: { error: error.message }, pairedItem: { item: i } });
      } else {
        throw new NodeApiError(this.getNode(), error);
      }
    }
  }

  return returnData;
}

function generateRandomId(): string {
  return Math.floor(Math.random() * 1000000).toString();
}

async function executeValidatorStakingOperations(
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
        case 'vote': {
          const group = this.getNodeParameter('group', i) as string;
          const value = this.getNodeParameter('value', i) as string;
          const privateKey = this.getNodeParameter('privateKey', i) as string;

          const options: any = {
            method: 'POST',
            url: credentials.baseUrl || 'https://forno.celo.org',
            headers: {
              'Content-Type': 'application/json',
            },
            body: {
              jsonrpc: '2.0',
              method: 'eth_sendTransaction',
              params: [{
                to: '0x8D6677192144292870907E3Fa8A5527fE55A7ff6', // Election contract
                data: `0x580d747c${group.slice(2).padStart(64, '0')}${BigInt(value).toString(16).padStart(64, '0')}`,
                gas: '0x5208',
                gasPrice: '0x174876e800',
              }],
              id: generateRandomId(),
            },
            json: true,
          };

          result = await this.helpers.httpRequest(options) as any;
          break;
        }

        case 'activate': {
          const group = this.getNodeParameter('group', i) as string;
          const privateKey = this.getNodeParameter('privateKey', i) as string;

          const options: any = {
            method: 'POST',
            url: credentials.baseUrl || 'https://forno.celo.org',
            headers: {
              'Content-Type': 'application/json',
            },
            body: {
              jsonrpc: '2.0',
              method: 'eth_sendTransaction',
              params: [{
                to: '0x8D6677192144292870907E3Fa8A5527fE55A7ff6', // Election contract
                data: `0x441a3e70${group.slice(2).padStart(64, '0')}`,
                gas: '0x5208',
                gasPrice: '0x174876e800',
              }],
              id: generateRandomId(),
            },
            json: true,
          };

          result = await this.helpers.httpRequest(options) as any;
          break;
        }

        case 'revoke': {
          const group = this.getNodeParameter('group', i) as string;
          const value = this.getNodeParameter('value', i) as string;
          const privateKey = this.getNodeParameter('privateKey', i) as string;

          const options: any = {
            method: 'POST',
            url: credentials.baseUrl || 'https://forno.celo.org',
            headers: {
              'Content-Type': 'application/json',
            },
            body: {
              jsonrpc: '2.0',
              method: 'eth_sendTransaction',
              params: [{
                to: '0x8D6677192144292870907E3Fa8A5527fE55A7ff6', // Election contract
                data: `0x6e198475${group.slice(2).padStart(64, '0')}${BigInt(value).toString(16).padStart(64, '0')}`,
                gas: '0x5208',
                gasPrice: '0x174876e800',
              }],
              id: generateRandomId(),
            },
            json: true,
          };

          result = await this.helpers.httpRequest(options) as any;
          break;
        }

        case 'getVotesForGroup': {
          const group = this.getNodeParameter('group', i) as string;
          const voter = this.getNodeParameter('voter', i) as string;

          const options: any = {
            method: 'POST',
            url: credentials.baseUrl || 'https://forno.celo.org',
            headers: {
              'Content-Type': 'application/json',
            },
            body: {
              jsonrpc: '2.0',
              method: 'eth_call',
              params: [{
                to: '0x8D6677192144292870907E3Fa8A5527fE55A7ff6', // Election contract
                data: `0x2f2d783b${voter.slice(2).padStart(64, '0')}${group.slice(2).padStart(64, '0')}`,
              }, 'latest'],
              id: generateRandomId(),
            },
            json: true,
          };

          result = await this.helpers.httpRequest(options) as any;
          break;
        }

        case 'getElectedValidators': {
          const options: any = {
            method: 'POST',
            url: credentials.baseUrl || 'https://forno.celo.org',
            headers: {
              'Content-Type': 'application/json',
            },
            body: {
              jsonrpc: '2.0',
              method: 'eth_call',
              params: [{
                to: '0x8D6677192144292870907E3Fa8A5527fE55A7ff6', // Election contract
                data: '0x677342ce', // getElectedValidators()
              }, 'latest'],
              id: generateRandomId(),
            },
            json: true,
          };

          result = await this.helpers.httpRequest(options) as any;
          break;
        }

        case 'getValidatorGroups': {
          const options: any = {
            method: 'POST',
            url: credentials.baseUrl || 'https://forno.celo.org',
            headers: {
              'Content-Type': 'application/json',
            },
            body: {
              jsonrpc: '2.0',
              method: 'eth_call',
              params: [{
                to: '0x000000000000000000000000000000000000ce10', // Validators contract
                data: '0x0c9fd581', // getRegisteredValidatorGroups()
              }, 'latest'],
              id: generateRandomId(),
            },
            json: true,
          };

          result = await this.helpers.httpRequest(options) as any;
          break;
        }

        case 'lock': {
          const value = this.getNodeParameter('value', i) as string;
          const privateKey = this.getNodeParameter('privateKey', i) as string;

          const options: any = {
            method: 'POST',
            url: credentials.baseUrl || 'https://forno.celo.org',
            headers: {
              'Content-Type': 'application/json',
            },
            body: {
              jsonrpc: '2.0',
              method: 'eth_sendTransaction',
              params: [{
                to: '0x6cC083Aed9e3ebe302A6336dBC7c921C9f03349E', // LockedGold contract
                data: '0xf83d08ba',
                value: `0x${BigInt(value).toString(16)}`,
                gas: '0x5208',
                gasPrice: '0x174876e800',
              }],
              id: generateRandomId(),
            },
            json: true,
          };

          result = await this.helpers.httpRequest(options) as any;
          break;
        }

        case 'unlock': {
          const value = this.getNodeParameter('value', i) as string;
          const privateKey = this.getNodeParameter('privateKey', i) as string;

          const options: any = {
            method: 'POST',
            url: credentials.baseUrl || 'https://forno.celo.org',
            headers: {
              'Content-Type': 'application/json',
            },
            body: {
              jsonrpc: '2.0',
              method: 'eth_sendTransaction',
              params: [{
                to: '0x6cC083Aed9e3ebe302A6336dBC7c921C9f03349E',
                data: `0x2e1a7d4d${BigInt(value).toString(16).padStart(64, '0')}`,
                gas: '0x5208',
                gasPrice: '0x174876e800',
              }],
              id: generateRandomId(),
            },
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
        throw new NodeApiError(this.getNode(), error);
      }
    }
  }

  return returnData;
}

async function executeGovernanceOperations(
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
        case 'propose': {
          const values = this.getNodeParameter('values', i) as any;
          const destinations = this.getNodeParameter('destinations', i) as any;
          const data = this.getNodeParameter('data', i) as any;
          const descriptionURL = this.getNodeParameter('descriptionURL', i) as string;
          const privateKey = this.getNodeParameter('privateKey', i) as string;

          const options: any = {
            method: 'POST',
            url: credentials.baseUrl || 'https://forno.celo.org',
            headers: {
              'Content-Type': 'application/json',
            },
            json: true,
            body: {
              jsonrpc: '2.0',
              method: 'eth_sendRawTransaction',
              params: [await signGovernanceTransaction(
                'propose',
                { values, destinations, data, descriptionURL },
                privateKey
              )],
              id: 1,
            },
          };

          result = await this.helpers.httpRequest(options) as any;
          break;
        }

        case 'vote': {
          const proposalId = this.getNodeParameter('proposalId', i) as string;
          const vote = this.getNodeParameter('vote', i) as string;
          const privateKey = this.getNodeParameter('privateKey', i) as string;

          const options: any = {
            method: 'POST',
            url: credentials.baseUrl || 'https://forno.celo.org',
            headers: {
              'Content-Type': 'application/json',
            },
            json: true,
            body: {
              jsonrpc: '2.0',
              method: 'eth_sendRawTransaction',
              params: [await signGovernanceTransaction(
                'vote',
                { proposalId, vote },
                privateKey
              )],
              id: 1,
            },
          };

          result = await this.helpers.httpRequest(options) as any;
          break;
        }

        case 'getProposal': {
          const proposalId = this.getNodeParameter('proposalId', i) as string;

          const options: any = {
            method: 'POST',
            url: credentials.baseUrl || 'https://forno.celo.org',
            headers: {
              'Content-Type': 'application/json',
            },
            json: true,
            body: {
              jsonrpc: '2.0',
              method: 'eth_call',
              params: [
                {
                  to: '0x8D6677192144292870907E3Fa8A5527fE55A7ff6', // Governance contract address
                  data: `0x013cf08b${proposalId.padStart(64, '0')}`, // getProposal function selector
                },
                'latest'
              ],
              id: 1,
            },
          };

          result = await this.helpers.httpRequest(options) as any;
          break;
        }

        case 'getProposals': {
          const options: any = {
            method: 'POST',
            url: credentials.baseUrl || 'https://forno.celo.org',
            headers: {
              'Content-Type': 'application/json',
            },
            json: true,
            body: {
              jsonrpc: '2.0',
              method: 'eth_call',
              params: [
                {
                  to: '0x8D6677192144292870907E3Fa8A5527fE55A7ff6', // Governance contract address
                  data: '0x32ed5b12', // getProposals function selector
                },
                'latest'
              ],
              id: 1,
            },
          };

          result = await this.helpers.httpRequest(options) as any;
          break;
        }

        case 'execute': {
          const proposalId = this.getNodeParameter('proposalId', i) as string;
          const privateKey = this.getNodeParameter('privateKey', i) as string;

          const options: any = {
            method: 'POST',
            url: credentials.baseUrl || 'https://forno.celo.org',
            headers: {
              'Content-Type': 'application/json',
            },
            json: true,
            body: {
              jsonrpc: '2.0',
              method: 'eth_sendRawTransaction',
              params: [await signGovernanceTransaction(
                'execute',
                { proposalId },
                privateKey
              )],
              id: 1,
            },
          };

          result = await this.helpers.httpRequest(options) as any;
          break;
        }

        case 'getVoteRecord': {
          const address = this.getNodeParameter('address', i) as string;
          const proposalId = this.getNodeParameter('proposalId', i) as string;

          const options: any = {
            method: 'POST',
            url: credentials.baseUrl || 'https://forno.celo.org',
            headers: {
              'Content-Type': 'application/json',
            },
            json: true,
            body: {
              jsonrpc: '2.0',
              method: 'eth_call',
              params: [
                {
                  to: '0x8D6677192144292870907E3Fa8A5527fE55A7ff6', // Governance contract address
                  data: `0x8782084e${proposalId.padStart(64, '0')}${address.slice(2).padStart(64, '0')}`, // getVoteRecord function selector
                },
                'latest'
              ],
              id: 1,
            },
          };

          result = await this.helpers.httpRequest(options) as any;
          break;
        }

        case 'getQueue': {
          const options: any = {
            method: 'POST',
            url: credentials.baseUrl || 'https://forno.celo.org',
            headers: {
              'Content-Type': 'application/json',
            },
            json: true,
            body: {
              jsonrpc: '2.0',
              method: 'eth_call',
              params: [
                {
                  to: '0x8D6677192144292870907E3Fa8A5527fE55A7ff6', // Governance contract address
                  data: '0xf5ce59b7', // getQueue function selector
                },
                'latest'
              ],
              id: 1,
            },
          };

          result = await this.helpers.httpRequest(options) as any;
          break;
        }

        case 'upvote': {
          const proposalId = this.getNodeParameter('proposalId', i) as string;
          const privateKey = this.getNodeParameter('privateKey', i) as string;

          const options: any = {
            method: 'POST',
            url: credentials.baseUrl || 'https://forno.celo.org',
            headers: {
              'Content-Type': 'application/json',
            },
            json: true,
            body: {
              jsonrpc: '2.0',
              method: 'eth_sendRawTransaction',
              params: [await signGovernanceTransaction(
                'upvote',
                { proposalId },
                privateKey
              )],
              id: 1,
            },
          };

          result = await this.helpers.httpRequest(options) as any;
          break;
        }

        default:
          throw new NodeOperationError(this.getNode(), `Unknown operation: ${operation}`);
      }

      if (result.error) {
        throw new NodeApiError(this.getNode(), result.error);
      }

      returnData.push({ json: result.result || result, pairedItem: { item: i } });
    } catch (error: any) {
      if (this.continueOnFail()) {
        returnData.push({ json: { error: error.message }, pairedItem: { item: i } });
      } else {
        throw error;
      }
    }
  }

  return returnData;
}

async function signGovernanceTransaction(method: string, params: any, privateKey: string): Promise<string> {
  // This is a simplified implementation - in practice, you would use a proper
  // transaction signing library like ethers.js or web3.js
  const encodedData = encodeGovernanceCall(method, params);
  
  // Mock signed transaction - in practice this would be properly signed
  return `0x${encodedData}${privateKey.slice(-8)}`;
}

function encodeGovernanceCall(method: string, params: any): string {
  const methodSignatures: any = {
    propose: '0xda35c664',
    vote: '0x15373e3d',
    execute: '0xfe0d94c1',
    upvote: '0x6cbf8b5c',
  };

  const signature = methodSignatures[method] || '0x00000000';
  
  // Simple parameter encoding - in practice would use proper ABI encoding
  let encodedParams = '';
  Object.values(params).forEach((param: any) => {
    if (typeof param === 'string') {
      encodedParams += param.replace('0x', '').padStart(64, '0');
    } else if (Array.isArray(param)) {
      encodedParams += param.length.toString(16).padStart(64, '0');
      param.forEach((item: any) => {
        encodedParams += item.toString().replace('0x', '').padStart(64, '0');
      });
    }
  });

  return signature + encodedParams;
}

async function executeExchangeOperations(
  this: IExecuteFunctions,
  items: INodeExecutionData[],
): Promise<INodeExecutionData[]> {
  const returnData: INodeExecutionData[] = [];
  const operation = this.getNodeParameter('operation', 0) as string;
  const credentials = await this.getCredentials('celoApi') as any;

  const tokenAddresses: any = {
    CELO: '0x471EcE3750Da237f93B8E339c536989b8978a438',
    cUSD: '0x765DE816845861e75A25fCA122bb6898B8B1282a',
    cEUR: '0xD8763CBa276a3738E6DE85b4b3bF5FDed6D6cA73',
    cREAL: '0xe8537a3d056DA446677B9E9d6c5dB704EaAb4787',
  };

  function getExchangeAddress(sellToken: string, buyToken: string): string {
    if (sellToken === 'CELO' && buyToken === 'cUSD') return '0x67316300f17f063085Ca8bCa4bd7f7a5a3078308';
    if (sellToken === 'cUSD' && buyToken === 'CELO') return '0x67316300f17f063085Ca8bCa4bd7f7a5a3078308';
    if (sellToken === 'CELO' && buyToken === 'cEUR') return '0xE383394B913d7302c49F794C7d3243c429d53D1d';
    if (sellToken === 'cEUR' && buyToken === 'CELO') return '0xE383394B913d7302c49F794C7d3243c429d53D1d';
    if (sellToken === 'CELO' && buyToken === 'cREAL') return '0x8f2Cf9855C919AFAC8Bd2E7acEc0205ed568a4EA';
    if (sellToken === 'cREAL' && buyToken === 'CELO') return '0x8f2Cf9855C919AFAC8Bd2E7acEc0205ed568a4EA';
    throw new NodeOperationError(this.getNode(), `Exchange pair ${sellToken}/${buyToken} not supported`);
  }

  for (let i = 0; i < items.length; i++) {
    try {
      let result: any;

      switch (operation) {
        case 'exchange': {
          const sellAmount = this.getNodeParameter('sellAmount', i) as string;
          const minBuyAmount = this.getNodeParameter('minBuyAmount', i) as string;
          const sellToken = this.getNodeParameter('sellToken', i) as string;
          const buyToken = this.getNodeParameter('buyToken', i) as string;
          const privateKey = this.getNodeParameter('privateKey', i) as string;

          const exchangeAddress = getExchangeAddress.call(this, sellToken, buyToken);
          
          // Get nonce
          const nonceOptions: any = {
            method: 'POST',
            url: credentials.baseUrl,
            headers: {
              'Content-Type': 'application/json',
            },
            json: {
              jsonrpc: '2.0',
              method: 'eth_getTransactionCount',
              params: [privateKey.slice(0, 42), 'latest'],
              id: 1,
            },
          };

          const nonceResponse = await this.helpers.httpRequest(nonceOptions) as any;
          const nonce = nonceResponse.result;

          // Exchange transaction
          const exchangeData = sellToken === 'CELO' 
            ? `0x94b576de${sellAmount.padStart(64, '0')}${minBuyAmount.padStart(64, '0')}`
            : `0xa9059cbb${exchangeAddress.slice(2).padStart(64, '0')}${sellAmount.padStart(64, '0')}`;

          const txOptions: any = {
            method: 'POST',
            url: credentials.baseUrl,
            headers: {
              'Content-Type': 'application/json',
            },
            json: {
              jsonrpc: '2.0',
              method: 'eth_sendRawTransaction',
              params: [{
                from: privateKey.slice(0, 42),
                to: sellToken === 'CELO' ? exchangeAddress : tokenAddresses[sellToken],
                value: sellToken === 'CELO' ? sellAmount : '0x0',
                data: exchangeData,
                gas: '0x5208',
                gasPrice: '0x3b9aca00',
                nonce: nonce,
              }],
              id: 1,
            },
          };

          result = await this.helpers.httpRequest(txOptions) as any;
          break;
        }

        case 'getExchangeRate': {
          const sellToken = this.getNodeParameter('sellToken', i) as string;
          const buyToken = this.getNodeParameter('buyToken', i) as string;
          const sellAmount = this.getNodeParameter('sellAmount', i) as string;

          const exchangeAddress = getExchangeAddress.call(this, sellToken, buyToken);
          const methodId = sellToken === 'CELO' ? '0x935b5e8b' : '0x2e9cd96d';
          const data = methodId + sellAmount.padStart(64, '0');

          const options: any = {
            method: 'POST',
            url: credentials.baseUrl,
            headers: {
              'Content-Type': 'application/json',
            },
            json: {
              jsonrpc: '2.0',
              method: 'eth_call',
              params: [
                {
                  to: exchangeAddress,
                  data: data,
                },
                'latest',
              ],
              id: 1,
            },
          };

          result = await this.helpers.httpRequest(options) as any;
          break;
        }

        case 'getBuyTokenAmount': {
          const sellToken = this.getNodeParameter('sellToken', i) as string;
          const buyToken = this.getNodeParameter('buyToken', i) as string;
          const sellAmount = this.getNodeParameter('sellAmount', i) as string;

          const exchangeAddress = getExchangeAddress.call(this, sellToken, buyToken);
          const methodId = sellToken === 'CELO' ? '0x935b5e8b' : '0x2e9cd96d';
          const data = methodId + sellAmount.padStart(64, '0');

          const options: any = {
            method: 'POST',
            url: credentials.baseUrl,
            headers: {
              'Content-Type': 'application/json',
            },
            json: {
              jsonrpc: '2.0',
              method: 'eth_call',
              params: [
                {
                  to: exchangeAddress,
                  data: data,
                },
                'latest',
              ],
              id: 1,
            },
          };

          result = await this.helpers.httpRequest(options) as any;
          break;
        }

        case 'getSellTokenAmount': {
          const sellToken = this.getNodeParameter('sellToken', i) as string;
          const buyToken = this.getNodeParameter('buyToken', i) as string;
          const buyAmount = this.getNodeParameter('buyAmount', i) as string;

          const exchangeAddress = getExchangeAddress.call(this, sellToken, buyToken);
          const methodId = sellToken === 'CELO' ? '0x2d40016b' : '0x7e1c42bd';
          const data = methodId + buyAmount.padStart(64, '0');

          const options: any = {
            method: 'POST',
            url: credentials.baseUrl,
            headers: {
              'Content-Type': 'application/json',
            },
            json: {
              jsonrpc: '2.0',
              method: 'eth_call',
              params: [
                {
                  to: exchangeAddress,
                  data: data,
                },
                'latest',
              ],
              id: 1,
            },
          };

          result = await this.helpers.httpRequest(options) as any;
          break;
        }

        case 'getReserves': {
          const reserveAddress = '0x9380fA34Fd9e4Fd14c06305fd7B6199089eD4eb9';
          const options: any = {
            method: 'POST',
            url: credentials.baseUrl,
            headers: {
              'Content-Type': 'application/json',
            },
            json: {
              jsonrpc: '2.0',
              method: 'eth_call',
              params: [
                {
                  to: reserveAddress,
                  data: '0x0902f1ac', // getReserves()
                },
                'latest',
              ],
              id: 1,
            },
          };

          result = await this.helpers.httpRequest(options) as any;
          break;
        }

        case 'getReserveRatio': {
          const token = this.getNodeParameter('token', i) as string;
          const exchangeAddress = getExchangeAddress.call(this, 'CELO', token);

          const options: any = {
            method: 'POST',
            url: credentials.baseUrl,
            headers: {
              'Content-Type': 'application/json',
            },
            json: {
              jsonrpc: '2.0',
              method: 'eth_call',
              params: [
                {
                  to: exchangeAddress,
                  data: '0x1e83409a', // getReserveRatio()
                },
                'latest',
              ],
              id: 1,
            },
          };

          result = await this.helpers.httpRequest(options) as any;
          break;
        }

        default:
          throw new NodeOperationError(
            this.getNode(),
            `Unknown operation: ${operation}`,
          );
      }

      returnData.push({ json: result, pairedItem: { item: i } });
    } catch (error: any) {
      if (this.continueOnFail()) {
        returnData.push({ json: { error: error.message }, pairedItem: { item: i } });
      } else {
        throw error;
      }
    }
  }

  return returnData;
}
