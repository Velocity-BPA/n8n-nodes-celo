import { ICredentialType, INodeProperties } from 'n8n-workflow';

export class CeloApi implements ICredentialType {
	name = 'celoApi';
	displayName = 'Celo API';
	documentationUrl = 'https://docs.celo.org';
	properties: INodeProperties[] = [
		{
			displayName: 'RPC Endpoint URL',
			name: 'rpcUrl',
			type: 'string',
			default: 'https://forno.celo.org',
			required: true,
			description: 'The Celo RPC endpoint URL. Use https://forno.celo.org for mainnet or custom endpoint.',
		},
		{
			displayName: 'Private Key',
			name: 'privateKey',
			type: 'string',
			typeOptions: {
				password: true,
			},
			default: '',
			description: 'Private key for signing transactions (optional, only needed for write operations)',
		},
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
					name: 'Alfajores Testnet',
					value: 'alfajores',
				},
				{
					name: 'Custom',
					value: 'custom',
				},
			],
			default: 'mainnet',
			description: 'The Celo network to connect to',
		},
	];
}