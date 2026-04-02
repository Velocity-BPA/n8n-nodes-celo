import {
	ICredentialType,
	INodeProperties,
} from 'n8n-workflow';

export class CeloApi implements ICredentialType {
	name = 'celoApi';
	displayName = 'Celo API';
	documentationUrl = 'https://docs.celo.org/developer/forno';
	properties: INodeProperties[] = [
		{
			displayName: 'API Key',
			name: 'apiKey',
			type: 'string',
			typeOptions: {
				password: true,
			},
			default: '',
			description: 'API key for Celo Forno service',
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
					name: 'Baklava Testnet',
					value: 'baklava',
				},
			],
			default: 'mainnet',
			description: 'The Celo network to connect to',
		},
		{
			displayName: 'Base URL',
			name: 'baseUrl',
			type: 'string',
			default: 'https://forno.celo.org',
			description: 'Base URL for the Celo API endpoint',
		},
	];
}