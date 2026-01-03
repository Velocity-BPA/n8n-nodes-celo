/*
 * Copyright (c) Velocity BPA, LLC
 * Licensed under the Business Source License 1.1
 * Commercial use requires a separate commercial license.
 * See LICENSE file for details.
 */

import type {
  IPollFunctions,
  INodeExecutionData,
  INodeType,
  INodeTypeDescription,
  IDataObject,
} from 'n8n-workflow';

import {
  makeRpcCall,
  makeExplorerCall,
  getBlockNumber,
  formatUnits,
  getLogs,
} from './transport/celoClient';
import { formatTokenAmount, toHex } from './utils/helpers';
import { CELO_CONTRACTS, STABLECOINS } from './constants/celo.constants';
import type { CeloCredentials, CeloNetwork } from './utils/types';

// Emit licensing notice once on module load
const LICENSING_NOTICE_EMITTED = Symbol.for('n8n-nodes-celo-trigger-licensing-notice');
if (!(global as Record<symbol, boolean>)[LICENSING_NOTICE_EMITTED]) {
  console.warn(`
[Velocity BPA Licensing Notice]

This n8n node is licensed under the Business Source License 1.1 (BSL 1.1).

Use of this node by for-profit organizations in production environments requires a commercial license from Velocity BPA.

For licensing information, visit https://velobpa.com/licensing or contact licensing@velobpa.com.
`);
  (global as Record<symbol, boolean>)[LICENSING_NOTICE_EMITTED] = true;
}

export class CeloTrigger implements INodeType {
  description: INodeTypeDescription = {
    displayName: 'Celo Trigger',
    name: 'celoTrigger',
    icon: 'file:celo.svg',
    group: ['trigger'],
    version: 1,
    subtitle: '={{$parameter["event"]}}',
    description: 'Trigger on Celo blockchain events',
    defaults: {
      name: 'Celo Trigger',
    },
    inputs: [],
    outputs: ['main'],
    credentials: [
      {
        name: 'celoApi',
        required: true,
      },
    ],
    polling: true,
    properties: [
      {
        displayName: 'Event',
        name: 'event',
        type: 'options',
        noDataExpression: true,
        options: [
          {
            name: 'Governance Proposal',
            value: 'governanceProposal',
            description: 'New governance proposal created',
          },
          {
            name: 'New Transaction to Address',
            value: 'newTransactionToAddress',
            description: 'New transaction sent to a specific address',
          },
          {
            name: 'Stablecoin Exchange',
            value: 'stablecoinExchange',
            description: 'Mento exchange event',
          },
          {
            name: 'Staking Reward',
            value: 'stakingReward',
            description: 'Staking reward distribution',
          },
          {
            name: 'Token Transfer',
            value: 'tokenTransfer',
            description: 'Token transfer event for any token',
          },
          {
            name: 'Validator Election',
            value: 'validatorElection',
            description: 'New epoch and validator election',
          },
        ],
        default: 'newTransactionToAddress',
        required: true,
      },
      
      // Address to watch
      {
        displayName: 'Address',
        name: 'address',
        type: 'string',
        default: '',
        placeholder: '0x...',
        required: true,
        description: 'Address to watch for transactions',
        displayOptions: {
          show: {
            event: ['newTransactionToAddress'],
          },
        },
      },
      
      // Token address for transfer events
      {
        displayName: 'Token',
        name: 'tokenType',
        type: 'options',
        options: [
          { name: 'Any Token', value: 'any' },
          { name: 'CELO', value: 'celo' },
          { name: 'cUSD', value: 'cUSD' },
          { name: 'cEUR', value: 'cEUR' },
          { name: 'cREAL', value: 'cREAL' },
          { name: 'Custom Token', value: 'custom' },
        ],
        default: 'any',
        displayOptions: {
          show: {
            event: ['tokenTransfer'],
          },
        },
      },
      {
        displayName: 'Custom Token Address',
        name: 'customTokenAddress',
        type: 'string',
        default: '',
        placeholder: '0x...',
        displayOptions: {
          show: {
            event: ['tokenTransfer'],
            tokenType: ['custom'],
          },
        },
      },
      {
        displayName: 'Filter Address',
        name: 'filterAddress',
        type: 'string',
        default: '',
        placeholder: '0x... (optional)',
        description: 'Only trigger for transfers involving this address',
        displayOptions: {
          show: {
            event: ['tokenTransfer'],
          },
        },
      },
      
      // Stablecoin for exchange events
      {
        displayName: 'Stablecoin',
        name: 'stablecoin',
        type: 'options',
        options: [
          { name: 'All Stablecoins', value: 'all' },
          { name: 'cUSD', value: 'cUSD' },
          { name: 'cEUR', value: 'cEUR' },
          { name: 'cREAL', value: 'cREAL' },
        ],
        default: 'all',
        displayOptions: {
          show: {
            event: ['stablecoinExchange'],
          },
        },
      },
      
      // Validator address for staking rewards
      {
        displayName: 'Validator/Group Address',
        name: 'validatorAddress',
        type: 'string',
        default: '',
        placeholder: '0x... (optional)',
        description: 'Filter for specific validator or group',
        displayOptions: {
          show: {
            event: ['stakingReward', 'validatorElection'],
          },
        },
      },
      
      // Options
      {
        displayName: 'Options',
        name: 'options',
        type: 'collection',
        placeholder: 'Add Option',
        default: {},
        options: [
          {
            displayName: 'Minimum Value',
            name: 'minValue',
            type: 'string',
            default: '0',
            description: 'Minimum transaction/transfer value in token units',
          },
          {
            displayName: 'Block Confirmations',
            name: 'confirmations',
            type: 'number',
            default: 1,
            description: 'Number of block confirmations to wait',
          },
        ],
      },
    ],
  };

  async poll(this: IPollFunctions): Promise<INodeExecutionData[][] | null> {
    const webhookData = this.getWorkflowStaticData('node');
    const event = this.getNodeParameter('event') as string;
    const credentials = await this.getCredentials('celoApi') as CeloCredentials;
    const network = credentials.network as CeloNetwork;
    const options = this.getNodeParameter('options', {}) as IDataObject;
    
    const returnData: INodeExecutionData[] = [];
    
    // Get current block number
    const currentBlockHex = await getBlockNumber(this as unknown as IPollFunctions, 0);
    const currentBlock = parseInt(currentBlockHex, 16);
    
    // Get last processed block
    const lastBlock = (webhookData.lastBlock as number) || currentBlock - 100;
    
    // Don't process if no new blocks
    if (currentBlock <= lastBlock) {
      return null;
    }
    
    // Limit block range to prevent timeout
    const fromBlock = Math.max(lastBlock + 1, currentBlock - 1000);
    const toBlock = currentBlock - (Number(options.confirmations) || 1);
    
    if (toBlock <= fromBlock) {
      return null;
    }
    
    try {
      // ==================== NEW TRANSACTION TO ADDRESS ====================
      if (event === 'newTransactionToAddress') {
        const address = this.getNodeParameter('address') as string;
        
        // Query explorer for transactions
        const transactions = await makeExplorerCall<unknown[]>(
          this as unknown as IPollFunctions,
          {
            module: 'account',
            action: 'txlist',
            address,
            startblock: String(fromBlock),
            endblock: String(toBlock),
            sort: 'asc',
          },
          0
        );
        
        if (Array.isArray(transactions)) {
          const minValue = BigInt(options.minValue ? String(options.minValue) : '0');
          
          for (const tx of transactions) {
            const txData = tx as Record<string, string>;
            
            // Filter by minimum value if set
            if (minValue > BigInt(0)) {
              const txValue = BigInt(txData.value || '0');
              if (txValue < minValue * BigInt(10 ** 18)) {
                continue;
              }
            }
            
            returnData.push({
              json: {
                event: 'newTransaction',
                network,
                address,
                transaction: {
                  hash: txData.hash,
                  blockNumber: txData.blockNumber,
                  timestamp: txData.timeStamp,
                  from: txData.from,
                  to: txData.to,
                  value: txData.value,
                  valueFormatted: formatUnits(txData.value || '0'),
                  gas: txData.gas,
                  gasPrice: txData.gasPrice,
                  gasUsed: txData.gasUsed,
                  isError: txData.isError === '1',
                },
              },
            });
          }
        }
      }
      
      // ==================== TOKEN TRANSFER ====================
      if (event === 'tokenTransfer') {
        const tokenType = this.getNodeParameter('tokenType') as string;
        const filterAddress = this.getNodeParameter('filterAddress', '') as string;
        
        let tokenAddress: string | undefined;
        
        if (tokenType === 'celo') {
          tokenAddress = network === 'mainnet' || network === 'custom'
            ? CELO_CONTRACTS.mainnet.GoldToken
            : CELO_CONTRACTS.alfajores.GoldToken;
        } else if (tokenType === 'cUSD' || tokenType === 'cEUR' || tokenType === 'cREAL') {
          const config = STABLECOINS[tokenType as keyof typeof STABLECOINS];
          tokenAddress = network === 'mainnet' || network === 'custom'
            ? config.mainnet
            : config.alfajores;
        } else if (tokenType === 'custom') {
          tokenAddress = this.getNodeParameter('customTokenAddress') as string;
        }
        
        // Transfer event topic: Transfer(address,address,uint256)
        const transferTopic = '0xddf252ad1be2c89b69c2b068fc378daa952ba7f163c4a11628f55a4df523b3ef';
        
        const filter: {
          fromBlock: string;
          toBlock: string;
          address?: string;
          topics: (string | string[] | null)[];
        } = {
          fromBlock: toHex(fromBlock),
          toBlock: toHex(toBlock),
          topics: [transferTopic, null, null],
        };
        
        if (tokenAddress) {
          filter.address = tokenAddress;
        }
        
        // Filter by specific address (from or to)
        if (filterAddress) {
          const paddedAddress = '0x' + filterAddress.toLowerCase().replace('0x', '').padStart(64, '0');
          // We need to query twice - once for from, once for to
          filter.topics[1] = paddedAddress;
        }
        
        const logs = await getLogs(
          this as unknown as IPollFunctions,
          filter,
          0
        );
        
        if (Array.isArray(logs)) {
          const minValue = BigInt(options.minValue ? String(options.minValue) : '0');
          
          for (const log of logs) {
            const logData = log as {
              address: string;
              topics: string[];
              data: string;
              blockNumber: string;
              transactionHash: string;
              logIndex: string;
            };
            
            const from = '0x' + logData.topics[1].slice(26);
            const to = '0x' + logData.topics[2].slice(26);
            const value = BigInt(logData.data).toString();
            
            // Filter by minimum value
            if (minValue > BigInt(0) && BigInt(value) < minValue * BigInt(10 ** 18)) {
              continue;
            }
            
            returnData.push({
              json: {
                event: 'tokenTransfer',
                network,
                transfer: {
                  tokenAddress: logData.address,
                  from,
                  to,
                  value,
                  valueFormatted: formatTokenAmount(value),
                  blockNumber: parseInt(logData.blockNumber, 16),
                  transactionHash: logData.transactionHash,
                  logIndex: logData.logIndex,
                },
              },
            });
          }
        }
        
        // If filtering by address, also check "to" field
        if (filterAddress && !tokenAddress) {
          const paddedAddress = '0x' + filterAddress.toLowerCase().replace('0x', '').padStart(64, '0');
          filter.topics[1] = null;
          filter.topics[2] = paddedAddress;
          
          const logsTo = await getLogs(
            this as unknown as IPollFunctions,
            filter,
            0
          );
          
          if (Array.isArray(logsTo)) {
            for (const log of logsTo) {
              const logData = log as {
                address: string;
                topics: string[];
                data: string;
                blockNumber: string;
                transactionHash: string;
                logIndex: string;
              };
              
              const from = '0x' + logData.topics[1].slice(26);
              const to = '0x' + logData.topics[2].slice(26);
              const value = BigInt(logData.data).toString();
              
              returnData.push({
                json: {
                  event: 'tokenTransfer',
                  network,
                  transfer: {
                    tokenAddress: logData.address,
                    from,
                    to,
                    value,
                    valueFormatted: formatTokenAmount(value),
                    blockNumber: parseInt(logData.blockNumber, 16),
                    transactionHash: logData.transactionHash,
                    logIndex: logData.logIndex,
                  },
                },
              });
            }
          }
        }
      }
      
      // ==================== GOVERNANCE PROPOSAL ====================
      if (event === 'governanceProposal') {
        const governanceContract = network === 'mainnet' || network === 'custom'
          ? CELO_CONTRACTS.mainnet.Governance
          : CELO_CONTRACTS.alfajores.Governance;
        
        // ProposalQueued event topic
        const proposalQueuedTopic = '0x1bfe527f3548d9258c2512b6689f0acfccdd0557d80a53845db25fc57e93d8fe';
        
        const logs = await getLogs(
          this as unknown as IPollFunctions,
          {
            fromBlock: toHex(fromBlock),
            toBlock: toHex(toBlock),
            address: governanceContract,
            topics: [proposalQueuedTopic],
          },
          0
        );
        
        if (Array.isArray(logs)) {
          for (const log of logs) {
            const logData = log as {
              data: string;
              blockNumber: string;
              transactionHash: string;
              topics: string[];
            };
            
            const proposalId = BigInt(logData.topics[1] || logData.data.slice(0, 66)).toString();
            
            returnData.push({
              json: {
                event: 'governanceProposal',
                network,
                proposal: {
                  id: proposalId,
                  blockNumber: parseInt(logData.blockNumber, 16),
                  transactionHash: logData.transactionHash,
                },
              },
            });
          }
        }
      }
      
      // ==================== VALIDATOR ELECTION ====================
      if (event === 'validatorElection') {
        const electionContract = network === 'mainnet' || network === 'custom'
          ? CELO_CONTRACTS.mainnet.Election
          : CELO_CONTRACTS.alfajores.Election;
        
        // EpochRewardsDistributedToVoters event
        const epochRewardsTopic = '0x91ba34d62474c14d6c623cd322f4256666c7a45b7fdaa3378e009d39dfcec2a7';
        
        const logs = await getLogs(
          this as unknown as IPollFunctions,
          {
            fromBlock: toHex(fromBlock),
            toBlock: toHex(toBlock),
            address: electionContract,
            topics: [epochRewardsTopic],
          },
          0
        );
        
        if (Array.isArray(logs)) {
          for (const log of logs) {
            const logData = log as {
              data: string;
              blockNumber: string;
              transactionHash: string;
              topics: string[];
            };
            
            returnData.push({
              json: {
                event: 'validatorElection',
                network,
                election: {
                  blockNumber: parseInt(logData.blockNumber, 16),
                  transactionHash: logData.transactionHash,
                  data: logData.data,
                },
              },
            });
          }
        }
      }
      
      // ==================== STAKING REWARD ====================
      if (event === 'stakingReward') {
        const validatorAddress = this.getNodeParameter('validatorAddress', '') as string;
        const electionContract = network === 'mainnet' || network === 'custom'
          ? CELO_CONTRACTS.mainnet.Election
          : CELO_CONTRACTS.alfajores.Election;
        
        // ValidatorEpochPaymentDistributed event
        const rewardTopic = '0x6f5937add2ec38a0fa4959bccd86e3fcc2aafb706cd3e6c0565f87a7b36b9975';
        
        const filter: {
          fromBlock: string;
          toBlock: string;
          address: string;
          topics: (string | null)[];
        } = {
          fromBlock: toHex(fromBlock),
          toBlock: toHex(toBlock),
          address: electionContract,
          topics: [rewardTopic, null],
        };
        
        if (validatorAddress) {
          filter.topics[1] = '0x' + validatorAddress.toLowerCase().replace('0x', '').padStart(64, '0');
        }
        
        const logs = await getLogs(
          this as unknown as IPollFunctions,
          filter,
          0
        );
        
        if (Array.isArray(logs)) {
          for (const log of logs) {
            const logData = log as {
              data: string;
              blockNumber: string;
              transactionHash: string;
              topics: string[];
            };
            
            const validator = '0x' + (logData.topics[1] || '').slice(26);
            
            returnData.push({
              json: {
                event: 'stakingReward',
                network,
                reward: {
                  validator,
                  blockNumber: parseInt(logData.blockNumber, 16),
                  transactionHash: logData.transactionHash,
                  data: logData.data,
                },
              },
            });
          }
        }
      }
      
      // ==================== STABLECOIN EXCHANGE ====================
      if (event === 'stablecoinExchange') {
        const stablecoin = this.getNodeParameter('stablecoin') as string;
        
        // Exchange event topic: Exchanged(address,uint256,uint256,bool)
        const exchangeTopic = '0x402ac9185b4616422c2f9e2f5a6e6a54bd8c0db5e0fee5f0d6a1c4b7e2d0a5e8';
        
        const exchangeContracts: string[] = [];
        
        if (stablecoin === 'all' || stablecoin === 'cUSD') {
          exchangeContracts.push(
            network === 'mainnet' || network === 'custom'
              ? CELO_CONTRACTS.mainnet.Exchange
              : CELO_CONTRACTS.alfajores.Exchange
          );
        }
        if (stablecoin === 'all' || stablecoin === 'cEUR') {
          exchangeContracts.push(
            network === 'mainnet' || network === 'custom'
              ? CELO_CONTRACTS.mainnet.ExchangeEUR
              : CELO_CONTRACTS.alfajores.ExchangeEUR
          );
        }
        if (stablecoin === 'all' || stablecoin === 'cREAL') {
          exchangeContracts.push(
            network === 'mainnet' || network === 'custom'
              ? CELO_CONTRACTS.mainnet.ExchangeBRL
              : CELO_CONTRACTS.alfajores.ExchangeBRL
          );
        }
        
        for (const exchangeContract of exchangeContracts) {
          const logs = await getLogs(
            this as unknown as IPollFunctions,
            {
              fromBlock: toHex(fromBlock),
              toBlock: toHex(toBlock),
              address: exchangeContract,
              topics: [exchangeTopic],
            },
            0
          );
          
          if (Array.isArray(logs)) {
            for (const log of logs) {
              const logData = log as {
                data: string;
                blockNumber: string;
                transactionHash: string;
                address: string;
              };
              
              returnData.push({
                json: {
                  event: 'stablecoinExchange',
                  network,
                  exchange: {
                    contract: logData.address,
                    blockNumber: parseInt(logData.blockNumber, 16),
                    transactionHash: logData.transactionHash,
                    data: logData.data,
                  },
                },
              });
            }
          }
        }
      }
      
    } catch (error) {
      // Log error but don't fail - update lastBlock and try again next poll
      console.error('Celo Trigger error:', error);
    }
    
    // Update last processed block
    webhookData.lastBlock = toBlock;
    
    if (returnData.length === 0) {
      return null;
    }
    
    return [returnData];
  }
}
