/**
 * Copyright (c) 2026 Velocity BPA
 * Licensed under the Business Source License 1.1
 */

import { IExecuteFunctions, INodeExecutionData } from 'n8n-workflow';
import { Celo } from '../nodes/Celo/Celo.node';

// Mock n8n-workflow
jest.mock('n8n-workflow', () => ({
  ...jest.requireActual('n8n-workflow'),
  NodeApiError: class NodeApiError extends Error {
    constructor(node: any, error: any) { super(error.message || 'API Error'); }
  },
  NodeOperationError: class NodeOperationError extends Error {
    constructor(node: any, message: string) { super(message); }
  },
}));

describe('Celo Node', () => {
  let node: Celo;

  beforeAll(() => {
    node = new Celo();
  });

  describe('Node Definition', () => {
    it('should have correct basic properties', () => {
      expect(node.description.displayName).toBe('Celo');
      expect(node.description.name).toBe('celo');
      expect(node.description.version).toBe(1);
      expect(node.description.inputs).toContain('main');
      expect(node.description.outputs).toContain('main');
    });

    it('should define 7 resources', () => {
      const resourceProp = node.description.properties.find(
        (p: any) => p.name === 'resource'
      );
      expect(resourceProp).toBeDefined();
      expect(resourceProp!.type).toBe('options');
      expect(resourceProp!.options).toHaveLength(7);
    });

    it('should have operation dropdowns for each resource', () => {
      const operations = node.description.properties.filter(
        (p: any) => p.name === 'operation'
      );
      expect(operations.length).toBe(7);
    });

    it('should require credentials', () => {
      expect(node.description.credentials).toBeDefined();
      expect(node.description.credentials!.length).toBeGreaterThan(0);
      expect(node.description.credentials![0].required).toBe(true);
    });

    it('should have parameters with proper displayOptions', () => {
      const params = node.description.properties.filter(
        (p: any) => p.displayOptions?.show?.resource
      );
      for (const param of params) {
        expect(param.displayOptions.show.resource).toBeDefined();
        expect(Array.isArray(param.displayOptions.show.resource)).toBe(true);
      }
    });
  });

  // Resource-specific tests
describe('Account Resource', () => {
	let mockExecuteFunctions: any;

	beforeEach(() => {
		mockExecuteFunctions = {
			getNodeParameter: jest.fn(),
			getCredentials: jest.fn().mockResolvedValue({
				apiKey: 'test-key',
				baseUrl: 'https://forno.celo.org',
			}),
			getInputData: jest.fn().mockReturnValue([{ json: {} }]),
			getNode: jest.fn().mockReturnValue({ name: 'Test Node' }),
			continueOnFail: jest.fn().mockReturnValue(false),
			helpers: {
				httpRequest: jest.fn(),
				requestWithAuthentication: jest.fn(),
			},
		};
	});

	describe('getBalance operation', () => {
		it('should get account balance successfully', async () => {
			mockExecuteFunctions.getNodeParameter
				.mockReturnValueOnce('getBalance')
				.mockReturnValueOnce('0x742d35Cc6634C0532925a3b8D598C3e6fE4dEd9C')
				.mockReturnValueOnce('latest');

			const mockResponse = {
				jsonrpc: '2.0',
				id: 1,
				result: '0x1b1ae4d6e2ef500000',
			};

			mockExecuteFunctions.helpers.httpRequest.mockResolvedValueOnce(mockResponse);

			const result = await executeAccountOperations.call(mockExecuteFunctions, [{ json: {} }]);

			expect(result[0].json).toEqual(mockResponse);
			expect(mockExecuteFunctions.helpers.httpRequest).toHaveBeenCalledWith({
				method: 'POST',
				url: 'https://forno.celo.org',
				headers: {
					'Content-Type': 'application/json',
					'Authorization': 'Bearer test-key',
				},
				body: {
					jsonrpc: '2.0',
					method: 'eth_getBalance',
					params: ['0x742d35Cc6634C0532925a3b8D598C3e6fE4dEd9C', 'latest'],
					id: 1,
				},
				json: true,
			});
		});

		it('should handle getBalance errors', async () => {
			mockExecuteFunctions.getNodeParameter
				.mockReturnValueOnce('getBalance')
				.mockReturnValueOnce('invalid-address')
				.mockReturnValueOnce('latest');

			mockExecuteFunctions.helpers.httpRequest.mockRejectedValueOnce(new Error('Invalid address'));
			mockExecuteFunctions.continueOnFail.mockReturnValueOnce(true);

			const result = await executeAccountOperations.call(mockExecuteFunctions, [{ json: {} }]);

			expect(result[0].json.error).toBe('Invalid address');
		});
	});

	describe('getTransactionCount operation', () => {
		it('should get transaction count successfully', async () => {
			mockExecuteFunctions.getNodeParameter
				.mockReturnValueOnce('getTransactionCount')
				.mockReturnValueOnce('0x742d35Cc6634C0532925a3b8D598C3e6fE4dEd9C')
				.mockReturnValueOnce('latest');

			const mockResponse = {
				jsonrpc: '2.0',
				id: 1,
				result: '0x1a',
			};

			mockExecuteFunctions.helpers.httpRequest.mockResolvedValueOnce(mockResponse);

			const result = await executeAccountOperations.call(mockExecuteFunctions, [{ json: {} }]);

			expect(result[0].json).toEqual(mockResponse);
		});
	});

	describe('getCode operation', () => {
		it('should get contract code successfully', async () => {
			mockExecuteFunctions.getNodeParameter
				.mockReturnValueOnce('getCode')
				.mockReturnValueOnce('0x742d35Cc6634C0532925a3b8D598C3e6fE4dEd9C')
				.mockReturnValueOnce('latest');

			const mockResponse = {
				jsonrpc: '2.0',
				id: 1,
				result: '0x608060405234801561001057600080fd5b50',
			};

			mockExecuteFunctions.helpers.httpRequest.mockResolvedValueOnce(mockResponse);

			const result = await executeAccountOperations.call(mockExecuteFunctions, [{ json: {} }]);

			expect(result[0].json).toEqual(mockResponse);
		});
	});

	describe('listAccounts operation', () => {
		it('should list accounts successfully', async () => {
			mockExecuteFunctions.getNodeParameter.mockReturnValueOnce('listAccounts');

			const mockResponse = {
				jsonrpc: '2.0',
				id: 1,
				result: ['0x742d35Cc6634C0532925a3b8D598C3e6fE4dEd9C'],
			};

			mockExecuteFunctions.helpers.httpRequest.mockResolvedValueOnce(mockResponse);

			const result = await executeAccountOperations.call(mockExecuteFunctions, [{ json: {} }]);

			expect(result[0].json).toEqual(mockResponse);
		});
	});

	describe('callContract operation', () => {
		it('should call contract successfully', async () => {
			const transaction = {
				to: '0x742d35Cc6634C0532925a3b8D598C3e6fE4dEd9C',
				data: '0x70a08231',
			};

			mockExecuteFunctions.getNodeParameter
				.mockReturnValueOnce('callContract')
				.mockReturnValueOnce(transaction)
				.mockReturnValueOnce('latest');

			const mockResponse = {
				jsonrpc: '2.0',
				id: 1,
				result: '0x0000000000000000000000000000000000000000000000000000000000000000',
			};

			mockExecuteFunctions.helpers.httpRequest.mockResolvedValueOnce(mockResponse);

			const result = await executeAccountOperations.call(mockExecuteFunctions, [{ json: {} }]);

			expect(result[0].json).toEqual(mockResponse);
		});
	});
});

describe('Transaction Resource', () => {
	let mockExecuteFunctions: any;

	beforeEach(() => {
		mockExecuteFunctions = {
			getNodeParameter: jest.fn(),
			getCredentials: jest.fn().mockResolvedValue({ 
				apiKey: 'test-key', 
				baseUrl: 'https://forno.celo.org' 
			}),
			getInputData: jest.fn().mockReturnValue([{ json: {} }]),
			getNode: jest.fn().mockReturnValue({ name: 'Test Node' }),
			continueOnFail: jest.fn().mockReturnValue(false),
			helpers: { 
				httpRequest: jest.fn(),
				requestWithAuthentication: jest.fn() 
			},
		};
	});

	it('should send transaction successfully', async () => {
		const mockTransaction = { to: '0x123', value: '1000000000000000000' };
		mockExecuteFunctions.getNodeParameter
			.mockReturnValueOnce('sendTransaction')
			.mockReturnValueOnce(mockTransaction);
		mockExecuteFunctions.helpers.httpRequest.mockResolvedValue({ 
			result: '0xabc123' 
		});

		const result = await executeTransactionOperations.call(
			mockExecuteFunctions,
			[{ json: {} }]
		);

		expect(result).toHaveLength(1);
		expect(result[0].json.result).toBe('0xabc123');
	});

	it('should handle send transaction error', async () => {
		mockExecuteFunctions.getNodeParameter
			.mockReturnValueOnce('sendTransaction')
			.mockReturnValueOnce({});
		mockExecuteFunctions.helpers.httpRequest.mockRejectedValue(
			new Error('Transaction failed')
		);
		mockExecuteFunctions.continueOnFail.mockReturnValue(true);

		const result = await executeTransactionOperations.call(
			mockExecuteFunctions,
			[{ json: {} }]
		);

		expect(result).toHaveLength(1);
		expect(result[0].json.error).toBe('Transaction failed');
	});

	it('should get transaction by hash successfully', async () => {
		const mockHash = '0xabc123';
		mockExecuteFunctions.getNodeParameter
			.mockReturnValueOnce('getTransactionByHash')
			.mockReturnValueOnce(mockHash);
		mockExecuteFunctions.helpers.httpRequest.mockResolvedValue({ 
			result: { hash: mockHash, blockNumber: '0x1' } 
		});

		const result = await executeTransactionOperations.call(
			mockExecuteFunctions,
			[{ json: {} }]
		);

		expect(result).toHaveLength(1);
		expect(result[0].json.result.hash).toBe(mockHash);
	});

	it('should estimate gas successfully', async () => {
		const mockTransaction = { to: '0x123', data: '0x456' };
		mockExecuteFunctions.getNodeParameter
			.mockReturnValueOnce('estimateGas')
			.mockReturnValueOnce(mockTransaction);
		mockExecuteFunctions.helpers.httpRequest.mockResolvedValue({ 
			result: '0x5208' 
		});

		const result = await executeTransactionOperations.call(
			mockExecuteFunctions,
			[{ json: {} }]
		);

		expect(result).toHaveLength(1);
		expect(result[0].json.result).toBe('0x5208');
	});

	it('should get gas price successfully', async () => {
		mockExecuteFunctions.getNodeParameter
			.mockReturnValueOnce('getGasPrice');
		mockExecuteFunctions.helpers.httpRequest.mockResolvedValue({ 
			result: '0x3b9aca00' 
		});

		const result = await executeTransactionOperations.call(
			mockExecuteFunctions,
			[{ json: {} }]
		);

		expect(result).toHaveLength(1);
		expect(result[0].json.result).toBe('0x3b9aca00');
	});
});

describe('Block Resource', () => {
  let mockExecuteFunctions: any;

  beforeEach(() => {
    mockExecuteFunctions = {
      getNodeParameter: jest.fn(),
      getCredentials: jest.fn().mockResolvedValue({ 
        apiKey: 'test-key', 
        baseUrl: 'https://forno.celo.org' 
      }),
      getInputData: jest.fn().mockReturnValue([{ json: {} }]),
      getNode: jest.fn().mockReturnValue({ name: 'Test Node' }),
      continueOnFail: jest.fn().mockReturnValue(false),
      helpers: { 
        httpRequest: jest.fn(),
        requestWithAuthentication: jest.fn() 
      },
    };
  });

  it('should get block by number successfully', async () => {
    mockExecuteFunctions.getNodeParameter
      .mockReturnValueOnce('getBlockByNumber')
      .mockReturnValueOnce('latest')
      .mockReturnValueOnce(false);
    
    mockExecuteFunctions.helpers.httpRequest.mockResolvedValue({
      jsonrpc: '2.0',
      id: 1,
      result: { number: '0x1234', hash: '0xabcd' }
    });

    const result = await executeBlockOperations.call(mockExecuteFunctions, [{ json: {} }]);
    expect(result).toHaveLength(1);
    expect(result[0].json.result.number).toBe('0x1234');
  });

  it('should handle getBlockByNumber error', async () => {
    mockExecuteFunctions.getNodeParameter
      .mockReturnValueOnce('getBlockByNumber')
      .mockReturnValueOnce('latest')
      .mockReturnValueOnce(false);
    
    mockExecuteFunctions.helpers.httpRequest.mockRejectedValue(new Error('Network error'));
    mockExecuteFunctions.continueOnFail.mockReturnValue(true);

    const result = await executeBlockOperations.call(mockExecuteFunctions, [{ json: {} }]);
    expect(result).toHaveLength(1);
    expect(result[0].json.error).toBe('Network error');
  });

  it('should get block by hash successfully', async () => {
    mockExecuteFunctions.getNodeParameter
      .mockReturnValueOnce('getBlockByHash')
      .mockReturnValueOnce('0xabcd1234')
      .mockReturnValueOnce(true);
    
    mockExecuteFunctions.helpers.httpRequest.mockResolvedValue({
      jsonrpc: '2.0',
      id: 1,
      result: { hash: '0xabcd1234', transactions: [] }
    });

    const result = await executeBlockOperations.call(mockExecuteFunctions, [{ json: {} }]);
    expect(result).toHaveLength(1);
    expect(result[0].json.result.hash).toBe('0xabcd1234');
  });

  it('should get latest block number successfully', async () => {
    mockExecuteFunctions.getNodeParameter
      .mockReturnValueOnce('getLatestBlock');
    
    mockExecuteFunctions.helpers.httpRequest.mockResolvedValue({
      jsonrpc: '2.0',
      id: 1,
      result: '0x5678'
    });

    const result = await executeBlockOperations.call(mockExecuteFunctions, [{ json: {} }]);
    expect(result).toHaveLength(1);
    expect(result[0].json.result).toBe('0x5678');
  });

  it('should get block transaction count successfully', async () => {
    mockExecuteFunctions.getNodeParameter
      .mockReturnValueOnce('getBlockTransactionCount')
      .mockReturnValueOnce('0xabcd1234');
    
    mockExecuteFunctions.helpers.httpRequest.mockResolvedValue({
      jsonrpc: '2.0',
      id: 1,
      result: '0x5'
    });

    const result = await executeBlockOperations.call(mockExecuteFunctions, [{ json: {} }]);
    expect(result).toHaveLength(1);
    expect(result[0].json.result).toBe('0x5');
  });

  it('should get uncle block information successfully', async () => {
    mockExecuteFunctions.getNodeParameter
      .mockReturnValueOnce('getUncle')
      .mockReturnValueOnce('0xabcd1234')
      .mockReturnValueOnce('0x0');
    
    mockExecuteFunctions.helpers.httpRequest.mockResolvedValue({
      jsonrpc: '2.0',
      id: 1,
      result: { hash: '0xuncle123', number: '0x100' }
    });

    const result = await executeBlockOperations.call(mockExecuteFunctions, [{ json: {} }]);
    expect(result).toHaveLength(1);
    expect(result[0].json.result.hash).toBe('0xuncle123');
  });
});

describe('Validator Resource', () => {
  let mockExecuteFunctions: any;

  beforeEach(() => {
    mockExecuteFunctions = {
      getNodeParameter: jest.fn(),
      getCredentials: jest.fn().mockResolvedValue({ 
        apiKey: 'test-key', 
        baseUrl: 'https://forno.celo.org' 
      }),
      getInputData: jest.fn().mockReturnValue([{ json: {} }]),
      getNode: jest.fn().mockReturnValue({ name: 'Test Node' }),
      continueOnFail: jest.fn().mockReturnValue(false),
      helpers: { 
        httpRequest: jest.fn(),
        requestWithAuthentication: jest.fn() 
      },
    };
  });

  describe('getValidators operation', () => {
    it('should get list of active validators successfully', async () => {
      const mockResponse = {
        jsonrpc: '2.0',
        id: 1,
        result: '0x0000000000000000000000000000000000000000000000000000000000000020'
      };

      mockExecuteFunctions.getNodeParameter
        .mockReturnValueOnce('getValidators')
        .mockReturnValueOnce('0x123456')
        .mockReturnValueOnce('latest')
        .mockReturnValueOnce('0xcontractaddress');

      mockExecuteFunctions.helpers.httpRequest.mockResolvedValue(mockResponse);

      const items = [{ json: {} }];
      const result = await executeValidatorOperations.call(mockExecuteFunctions, items);

      expect(result).toHaveLength(1);
      expect(result[0].json).toEqual(mockResponse);
      expect(mockExecuteFunctions.helpers.httpRequest).toHaveBeenCalledWith({
        method: 'POST',
        url: 'https://forno.celo.org',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': 'Bearer test-key'
        },
        json: true,
        body: {
          jsonrpc: '2.0',
          method: 'eth_call',
          params: [
            {
              to: '0xcontractaddress',
              data: '0x123456',
            },
            'latest',
          ],
          id: 1,
        },
      });
    });

    it('should handle errors when getting validators fails', async () => {
      mockExecuteFunctions.getNodeParameter
        .mockReturnValueOnce('getValidators')
        .mockReturnValueOnce('0x123456')
        .mockReturnValueOnce('latest')
        .mockReturnValueOnce('0xcontractaddress');

      mockExecuteFunctions.helpers.httpRequest.mockRejectedValue(new Error('Network error'));
      mockExecuteFunctions.continueOnFail.mockReturnValue(true);

      const items = [{ json: {} }];
      const result = await executeValidatorOperations.call(mockExecuteFunctions, items);

      expect(result).toHaveLength(1);
      expect(result[0].json.error).toBe('Network error');
    });
  });

  describe('isValidator operation', () => {
    it('should check if address is validator successfully', async () => {
      const mockResponse = {
        jsonrpc: '2.0',
        id: 1,
        result: '0x0000000000000000000000000000000000000000000000000000000000000001'
      };

      mockExecuteFunctions.getNodeParameter
        .mockReturnValueOnce('isValidator')
        .mockReturnValueOnce('0x123456ADDRESS_PLACEHOLDER789')
        .mockReturnValueOnce('latest')
        .mockReturnValueOnce('0xcontractaddress')
        .mockReturnValueOnce('0xvalidatoraddress');

      mockExecuteFunctions.helpers.httpRequest.mockResolvedValue(mockResponse);

      const items = [{ json: {} }];
      const result = await executeValidatorOperations.call(mockExecuteFunctions, items);

      expect(result).toHaveLength(1);
      expect(result[0].json).toEqual(mockResponse);
    });
  });

  describe('getValidatorGroup operation', () => {
    it('should get validator group information successfully', async () => {
      const mockResponse = {
        jsonrpc: '2.0',
        id: 1,
        result: '0x0000000000000000000000000000000000000000000000000000000000000020'
      };

      mockExecuteFunctions.getNodeParameter
        .mockReturnValueOnce('getValidatorGroup')
        .mockReturnValueOnce('0x123456ADDRESS_PLACEHOLDER789')
        .mockReturnValueOnce('latest')
        .mockReturnValueOnce('0xcontractaddress')
        .mockReturnValueOnce('0xvalidatoraddress');

      mockExecuteFunctions.helpers.httpRequest.mockResolvedValue(mockResponse);

      const items = [{ json: {} }];
      const result = await executeValidatorOperations.call(mockExecuteFunctions, items);

      expect(result).toHaveLength(1);
      expect(result[0].json).toEqual(mockResponse);
    });
  });
});

describe('Governance Resource', () => {
  let mockExecuteFunctions: any;

  beforeEach(() => {
    mockExecuteFunctions = {
      getNodeParameter: jest.fn(),
      getCredentials: jest.fn().mockResolvedValue({
        apiKey: 'test-key',
        baseUrl: 'https://forno.celo.org',
      }),
      getInputData: jest.fn().mockReturnValue([{ json: {} }]),
      getNode: jest.fn().mockReturnValue({ name: 'Test Node' }),
      continueOnFail: jest.fn().mockReturnValue(false),
      helpers: {
        httpRequest: jest.fn(),
        requestWithAuthentication: jest.fn(),
      },
    };
  });

  it('should get proposals successfully', async () => {
    const mockResponse = {
      jsonrpc: '2.0',
      result: '0x123456789abcdef',
      id: 1,
    };

    mockExecuteFunctions.getNodeParameter
      .mockReturnValueOnce('getProposals')
      .mockReturnValueOnce('mainnet')
      .mockReturnValueOnce({ to: '0x123', data: '0x456' })
      .mockReturnValueOnce('latest');

    mockExecuteFunctions.helpers.httpRequest.mockResolvedValue(JSON.stringify(mockResponse));

    const result = await executeGovernanceOperations.call(
      mockExecuteFunctions,
      [{ json: {} }],
    );

    expect(result).toHaveLength(1);
    expect(result[0].json).toEqual(mockResponse);
  });

  it('should handle get proposals error', async () => {
    mockExecuteFunctions.getNodeParameter
      .mockReturnValueOnce('getProposals')
      .mockReturnValueOnce('mainnet');

    mockExecuteFunctions.helpers.httpRequest.mockRejectedValue(new Error('API Error'));
    mockExecuteFunctions.continueOnFail.mockReturnValue(true);

    const result = await executeGovernanceOperations.call(
      mockExecuteFunctions,
      [{ json: {} }],
    );

    expect(result).toHaveLength(1);
    expect(result[0].json.error).toBe('API Error');
  });

  it('should get proposal details successfully', async () => {
    const mockResponse = {
      jsonrpc: '2.0',
      result: '0x987654321fedcba',
      id: 1,
    };

    mockExecuteFunctions.getNodeParameter
      .mockReturnValueOnce('getProposal')
      .mockReturnValueOnce('mainnet')
      .mockReturnValueOnce({ to: '0x789', data: '0xabc' })
      .mockReturnValueOnce('12345');

    mockExecuteFunctions.helpers.httpRequest.mockResolvedValue(JSON.stringify(mockResponse));

    const result = await executeGovernanceOperations.call(
      mockExecuteFunctions,
      [{ json: {} }],
    );

    expect(result).toHaveLength(1);
    expect(result[0].json).toEqual(mockResponse);
  });

  it('should vote on proposal successfully', async () => {
    const mockResponse = {
      jsonrpc: '2.0',
      result: '0xtransactionhash123',
      id: 1,
    };

    mockExecuteFunctions.getNodeParameter
      .mockReturnValueOnce('vote')
      .mockReturnValueOnce('mainnet')
      .mockReturnValueOnce({
        to: '0x123',
        data: '0x456',
        from: '0x789',
        gas: '0x5208',
        gasPrice: '0x3b9aca00',
      });

    mockExecuteFunctions.helpers.httpRequest.mockResolvedValue(JSON.stringify(mockResponse));

    const result = await executeGovernanceOperations.call(
      mockExecuteFunctions,
      [{ json: {} }],
    );

    expect(result).toHaveLength(1);
    expect(result[0].json).toEqual(mockResponse);
  });

  it('should handle vote error', async () => {
    mockExecuteFunctions.getNodeParameter
      .mockReturnValueOnce('vote')
      .mockReturnValueOnce('mainnet');

    mockExecuteFunctions.helpers.httpRequest.mockRejectedValue(new Error('Transaction failed'));
    mockExecuteFunctions.continueOnFail.mockReturnValue(false);

    await expect(
      executeGovernanceOperations.call(mockExecuteFunctions, [{ json: {} }]),
    ).rejects.toThrow('Transaction failed');
  });
});

describe('StableCoin Resource', () => {
  let mockExecuteFunctions: any;

  beforeEach(() => {
    mockExecuteFunctions = {
      getNodeParameter: jest.fn(),
      getCredentials: jest.fn().mockResolvedValue({ 
        apiKey: 'test-key', 
        baseUrl: 'https://forno.celo.org' 
      }),
      getInputData: jest.fn().mockReturnValue([{ json: {} }]),
      getNode: jest.fn().mockReturnValue({ name: 'Test Node' }),
      continueOnFail: jest.fn().mockReturnValue(false),
      helpers: { 
        httpRequest: jest.fn(),
        requestWithAuthentication: jest.fn() 
      },
    };
  });

  it('should get stablecoin balance successfully', async () => {
    mockExecuteFunctions.getNodeParameter
      .mockReturnValueOnce('getStableCoinBalance')
      .mockReturnValueOnce({ to: '0x123', data: '0xabc' })
      .mockReturnValueOnce('latest');
    
    mockExecuteFunctions.helpers.httpRequest.mockResolvedValue({
      jsonrpc: '2.0',
      result: '0x1000000000000000000',
      id: 1
    });

    const result = await executeStableCoinOperations.call(
      mockExecuteFunctions,
      [{ json: {} }]
    );

    expect(result).toHaveLength(1);
    expect(result[0].json.result).toBe('0x1000000000000000000');
  });

  it('should get exchange rate successfully', async () => {
    mockExecuteFunctions.getNodeParameter
      .mockReturnValueOnce('getExchangeRate')
      .mockReturnValueOnce({ to: '0x456', data: '0xdef' })
      .mockReturnValueOnce('latest');
    
    mockExecuteFunctions.helpers.httpRequest.mockResolvedValue({
      jsonrpc: '2.0',
      result: '0x1000000',
      id: 1
    });

    const result = await executeStableCoinOperations.call(
      mockExecuteFunctions,
      [{ json: {} }]
    );

    expect(result).toHaveLength(1);
    expect(result[0].json.result).toBe('0x1000000');
  });

  it('should mint stablecoin successfully', async () => {
    mockExecuteFunctions.getNodeParameter
      .mockReturnValueOnce('mintStableCoin')
      .mockReturnValueOnce({ 
        from: '0x123', 
        to: '0x456', 
        data: '0xabc',
        gas: '0x5208',
        gasPrice: '0x3b9aca00'
      });
    
    mockExecuteFunctions.helpers.httpRequest.mockResolvedValue({
      jsonrpc: '2.0',
      result: '0xtxhash123',
      id: 1
    });

    const result = await executeStableCoinOperations.call(
      mockExecuteFunctions,
      [{ json: {} }]
    );

    expect(result).toHaveLength(1);
    expect(result[0].json.result).toBe('0xtxhash123');
  });

  it('should handle API errors', async () => {
    mockExecuteFunctions.getNodeParameter
      .mockReturnValueOnce('getStableCoinBalance')
      .mockReturnValueOnce({ to: '0x123', data: '0xabc' })
      .mockReturnValueOnce('latest');
    
    mockExecuteFunctions.helpers.httpRequest.mockRejectedValue(
      new Error('Network error')
    );

    mockExecuteFunctions.continueOnFail.mockReturnValue(true);

    const result = await executeStableCoinOperations.call(
      mockExecuteFunctions,
      [{ json: {} }]
    );

    expect(result).toHaveLength(1);
    expect(result[0].json.error).toBe('Network error');
  });

  it('should throw error for unknown operation', async () => {
    mockExecuteFunctions.getNodeParameter.mockReturnValueOnce('unknownOperation');

    await expect(
      executeStableCoinOperations.call(mockExecuteFunctions, [{ json: {} }])
    ).rejects.toThrow('Unknown operation: unknownOperation');
  });
});

describe('Identity Resource', () => {
  let mockExecuteFunctions: any;

  beforeEach(() => {
    mockExecuteFunctions = {
      getNodeParameter: jest.fn(),
      getCredentials: jest.fn().mockResolvedValue({
        apiKey: 'test-key',
        baseUrl: 'https://forno.celo.org',
      }),
      getInputData: jest.fn().mockReturnValue([{ json: {} }]),
      getNode: jest.fn().mockReturnValue({ name: 'Test Node' }),
      continueOnFail: jest.fn().mockReturnValue(false),
      helpers: {
        httpRequest: jest.fn(),
        requestWithAuthentication: jest.fn(),
      },
    };
  });

  it('should get attestations successfully', async () => {
    mockExecuteFunctions.getNodeParameter
      .mockReturnValueOnce('getAttestations')
      .mockReturnValueOnce('mainnet')
      .mockReturnValueOnce({ to: '0x123', data: '0xabc' })
      .mockReturnValueOnce('latest');

    mockExecuteFunctions.helpers.httpRequest.mockResolvedValue(
      JSON.stringify({ jsonrpc: '2.0', result: '0x123', id: 1 })
    );

    const result = await executeIdentityOperations.call(mockExecuteFunctions, [{ json: {} }]);

    expect(result).toHaveLength(1);
    expect(result[0].json.result).toBe('0x123');
  });

  it('should handle get attestations error', async () => {
    mockExecuteFunctions.getNodeParameter
      .mockReturnValueOnce('getAttestations')
      .mockReturnValueOnce('mainnet')
      .mockReturnValueOnce({ to: '0x123', data: '0xabc' })
      .mockReturnValueOnce('latest');

    mockExecuteFunctions.helpers.httpRequest.mockRejectedValue(new Error('Network error'));
    mockExecuteFunctions.continueOnFail.mockReturnValue(true);

    const result = await executeIdentityOperations.call(mockExecuteFunctions, [{ json: {} }]);

    expect(result).toHaveLength(1);
    expect(result[0].json.error).toBe('Network error');
  });

  it('should request attestation successfully', async () => {
    mockExecuteFunctions.getNodeParameter
      .mockReturnValueOnce('requestAttestation')
      .mockReturnValueOnce('mainnet')
      .mockReturnValueOnce({ from: '0x123', to: '0x456', data: '0xabc' })
      .mockReturnValueOnce('21000')
      .mockReturnValueOnce('1000000000');

    mockExecuteFunctions.helpers.httpRequest.mockResolvedValue(
      JSON.stringify({ jsonrpc: '2.0', result: '0x789', id: 1 })
    );

    const result = await executeIdentityOperations.call(mockExecuteFunctions, [{ json: {} }]);

    expect(result).toHaveLength(1);
    expect(result[0].json.result).toBe('0x789');
  });

  it('should complete attestation successfully', async () => {
    mockExecuteFunctions.getNodeParameter
      .mockReturnValueOnce('completeAttestation')
      .mockReturnValueOnce('mainnet')
      .mockReturnValueOnce({ from: '0x123', to: '0x456', data: '0xdef' })
      .mockReturnValueOnce('')
      .mockReturnValueOnce('');

    mockExecuteFunctions.helpers.httpRequest.mockResolvedValue(
      JSON.stringify({ jsonrpc: '2.0', result: '0x999', id: 1 })
    );

    const result = await executeIdentityOperations.call(mockExecuteFunctions, [{ json: {} }]);

    expect(result).toHaveLength(1);
    expect(result[0].json.result).toBe('0x999');
  });

  it('should get attestation issuers successfully', async () => {
    mockExecuteFunctions.getNodeParameter
      .mockReturnValueOnce('getAttestationIssuers')
      .mockReturnValueOnce('alfajores')
      .mockReturnValueOnce({ to: '0x789', data: '0xdef' })
      .mockReturnValueOnce('latest');

    mockExecuteFunctions.helpers.httpRequest.mockResolvedValue(
      JSON.stringify({ jsonrpc: '2.0', result: ['0x111', '0x222'], id: 1 })
    );

    const result = await executeIdentityOperations.call(mockExecuteFunctions, [{ json: {} }]);

    expect(result).toHaveLength(1);
    expect(result[0].json.result).toEqual(['0x111', '0x222']);
  });
});
});
