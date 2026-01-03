/*
 * Copyright (c) Velocity BPA, LLC
 * Licensed under the Business Source License 1.1
 * Commercial use requires a separate commercial license.
 * See LICENSE file for details.
 */

import type {
  IAuthenticateGeneric,
  ICredentialTestRequest,
  ICredentialType,
  INodeProperties,
} from 'n8n-workflow';

export class CeloApi implements ICredentialType {
  name = 'celoApi';
  displayName = 'Celo API';
  documentationUrl = 'https://docs.celo.org/';
  properties: INodeProperties[] = [
    {
      displayName: 'Network',
      name: 'network',
      type: 'options',
      options: [
        {
          name: 'Mainnet',
          value: 'mainnet',
        },
        {
          name: 'Alfajores (Testnet)',
          value: 'alfajores',
        },
        {
          name: 'Baklava (Testnet)',
          value: 'baklava',
        },
        {
          name: 'Custom',
          value: 'custom',
        },
      ],
      default: 'mainnet',
      description: 'The Celo network to connect to',
    },
    {
      displayName: 'RPC Endpoint',
      name: 'rpcEndpoint',
      type: 'string',
      default: '',
      placeholder: 'https://forno.celo.org',
      description: 'Custom RPC endpoint URL. Leave empty to use the default for selected network.',
      displayOptions: {
        show: {
          network: ['custom'],
        },
      },
    },
    {
      displayName: 'Private Key',
      name: 'privateKey',
      type: 'string',
      typeOptions: {
        password: true,
      },
      default: '',
      description: 'Private key for signing transactions (hex format with or without 0x prefix)',
    },
    {
      displayName: 'Celoscan API Key',
      name: 'celoscanApiKey',
      type: 'string',
      typeOptions: {
        password: true,
      },
      default: '',
      description: 'API key for Celoscan (optional, for enhanced transaction history)',
    },
  ];

  authenticate: IAuthenticateGeneric = {
    type: 'generic',
    properties: {},
  };

  test: ICredentialTestRequest = {
    request: {
      method: 'POST',
      url: '={{$credentials.network === "mainnet" ? "https://forno.celo.org" : $credentials.network === "alfajores" ? "https://alfajores-forno.celo-testnet.org" : $credentials.network === "baklava" ? "https://baklava-forno.celo-testnet.org" : $credentials.rpcEndpoint}}',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        jsonrpc: '2.0',
        method: 'eth_chainId',
        params: [],
        id: 1,
      }),
    },
  };
}
