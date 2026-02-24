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

    it('should define 6 resources', () => {
      const resourceProp = node.description.properties.find(
        (p: any) => p.name === 'resource'
      );
      expect(resourceProp).toBeDefined();
      expect(resourceProp!.type).toBe('options');
      expect(resourceProp!.options).toHaveLength(6);
    });

    it('should have operation dropdowns for each resource', () => {
      const operations = node.description.properties.filter(
        (p: any) => p.name === 'operation'
      );
      expect(operations.length).toBe(6);
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
describe('Accounts Resource', () => {
  let mockExecuteFunctions: any;

  beforeEach(() => {
    mockExecuteFunctions = {
      getNodeParameter: jest.fn(),
      getCredentials: jest.fn().mockResolvedValue({
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
    it('should get CELO balance successfully', async () => {
      mockExecuteFunctions.getNodeParameter.mockImplementation((paramName: string) => {
        switch (paramName) {
          case 'operation': return 'getBalance';
          case 'address': return '0x742d35Cc6634C0532925a3b8D65d0A2E81ca1234';
          case 'blockNumber': return 'latest';
          case 'tokenContracts': return ['celo'];
          default: return undefined;
        }
      });

      mockExecuteFunctions.helpers.httpRequest.mockResolvedValue({
        jsonrpc: '2.0',
        id: 1,
        result: '0x1bc16d674ec80000'
      });

      const items = [{ json: {} }];
      const result = await executeAccountsOperations.call(mockExecuteFunctions, items);

      expect(result).toHaveLength(1);
      expect(result[0].json.address).toBe('0x742d35Cc6634C0532925a3b8D65d0A2E81ca1234');
      expect(result[0].json.balances.CELO).toBe('0x1bc16d674ec80000');
    });

    it('should handle API errors', async () => {
      mockExecuteFunctions.getNodeParameter.mockImplementation((paramName: string) => {
        switch (paramName) {
          case 'operation': return 'getBalance';
          case 'address': return '0x742d35Cc6634C0532925a3b8D65d0A2E81ca1234';
          case 'blockNumber': return 'latest';
          case 'tokenContracts': return ['celo'];
          default: return undefined;
        }
      });

      mockExecuteFunctions.helpers.httpRequest.mockResolvedValue({
        jsonrpc: '2.0',
        id: 1,
        error: { code: -32000, message: 'Invalid address' }
      });

      const items = [{ json: {} }];
      
      await expect(executeAccountsOperations.call(mockExecuteFunctions, items)).rejects.toThrow();
    });
  });

  describe('getAccountSummary operation', () => {
    it('should get account summary successfully', async () => {
      mockExecuteFunctions.getNodeParameter.mockImplementation((paramName: string) => {
        switch (paramName) {
          case 'operation': return 'getAccountSummary';
          case 'address': return '0x742d35Cc6634C0532925a3b8D65d0A2E81ca1234';
          default: return undefined;
        }
      });

      mockExecuteFunctions.helpers.httpRequest
        .mockResolvedValueOnce({ jsonrpc: '2.0', id: 1, result: '0x1bc16d674ec80000' })
        .mockResolvedValueOnce({ jsonrpc: '2.0', id: 2, result: '0x5' })
        .mockResolvedValueOnce({ jsonrpc: '2.0', id: 3, result: '0x' })
        .mockResolvedValueOnce({ jsonrpc: '2.0', id: 4, result: '0x0' })
        .mockResolvedValueOnce({ jsonrpc: '2.0', id: 5, result: '0x0' });

      const items = [{ json: {} }];
      const result = await executeAccountsOperations.call(mockExecuteFunctions, items);

      expect(result).toHaveLength(1);
      expect(result[0].json.address).toBe('0x742d35Cc6634C0532925a3b8D65d0A2E81ca1234');
      expect(result[0].json.celoBalance).toBe('0x1bc16d674ec80000');
      expect(result[0].json.transactionCount).toBe('0x5');
      expect(result[0].json.isContract).toBe(false);
    });
  });

  describe('createAccount operation', () => {
    it('should create new account successfully', async () => {
      mockExecuteFunctions.getNodeParameter.mockImplementation((paramName: string) => {
        switch (paramName) {
          case 'operation': return 'createAccount';
          default: return undefined;
        }
      });

      const items = [{ json: {} }];
      const result = await executeAccountsOperations.call(mockExecuteFunctions, items);

      expect(result).toHaveLength(1);
      expect(result[0].json.address).toMatch(/^0x[a-fA-F0-9]{40}$/);
      expect(result[0].json.privateKey).toMatch(/^0x[a-fA-F0-9]{64}$/);
      expect(result[0].json.warning).toContain('demo implementation');
    });
  });

  describe('error handling', () => {
    it('should handle errors when continueOnFail is true', async () => {
      mockExecuteFunctions.continueOnFail.mockReturnValue(true);
      mockExecuteFunctions.getNodeParameter.mockImplementation((paramName: string) => {
        switch (paramName) {
          case 'operation': return 'getBalance';
          case 'address': return 'invalid-address';
          default: return undefined;
        }
      });

      mockExecuteFunctions.helpers.httpRequest.mockRejectedValue(new Error('Network error'));

      const items = [{ json: {} }];
      const result = await executeAccountsOperations.call(mockExecuteFunctions, items);

      expect(result).toHaveLength(1);
      expect(result[0].json.error).toBe('Network error');
    });
  });
});

describe('StableTokens Resource', () => {
  let mockExecuteFunctions: any;

  beforeEach(() => {
    mockExecuteFunctions = {
      getNodeParameter: jest.fn(),
      getCredentials: jest.fn().mockResolvedValue({
        baseUrl: 'https://forno.celo.org',
      }),
      getInputData: jest.fn().mockReturnValue([{ json: {} }]),
      getNode: jest.fn().mockReturnValue({ name: 'Test Node' }),
      continueOnFail: jest.fn().mockReturnValue(false),
      helpers: {
        httpRequest: jest.fn(),
      },
    };
  });

  describe('balanceOf operation', () => {
    it('should get token balance successfully', async () => {
      mockExecuteFunctions.getNodeParameter.mockImplementation((param: string) => {
        switch (param) {
          case 'operation': return 'balanceOf';
          case 'tokenAddress': return '0x765DE816845861e75A25fCA122bb6898B8B1282a';
          case 'address': return '0x1234567890123456789012345678901234567890';
          default: return undefined;
        }
      });

      mockExecuteFunctions.helpers.httpRequest.mockResolvedValue(JSON.stringify({
        jsonrpc: '2.0',
        id: 1,
        result: '0x1BC16D674EC80000'
      }));

      const result = await executeStableTokensOperations.call(mockExecuteFunctions, [{ json: {} }]);

      expect(result).toHaveLength(1);
      expect(result[0].json).toHaveProperty('balance');
      expect(result[0].json).toHaveProperty('address');
      expect(result[0].json).toHaveProperty('tokenAddress');
    });

    it('should handle RPC error', async () => {
      mockExecuteFunctions.getNodeParameter.mockImplementation((param: string) => {
        switch (param) {
          case 'operation': return 'balanceOf';
          case 'tokenAddress': return '0x765DE816845861e75A25fCA122bb6898B8B1282a';
          case 'address': return '0x1234567890123456789012345678901234567890';
          default: return undefined;
        }
      });

      mockExecuteFunctions.helpers.httpRequest.mockResolvedValue(JSON.stringify({
        jsonrpc: '2.0',
        id: 1,
        error: { code: -32000, message: 'Invalid address' }
      }));

      await expect(
        executeStableTokensOperations.call(mockExecuteFunctions, [{ json: {} }])
      ).rejects.toThrow();
    });
  });

  describe('totalSupply operation', () => {
    it('should get total supply successfully', async () => {
      mockExecuteFunctions.getNodeParameter.mockImplementation((param: string) => {
        switch (param) {
          case 'operation': return 'totalSupply';
          case 'tokenAddress': return '0x765DE816845861e75A25fCA122bb6898B8B1282a';
          default: return undefined;
        }
      });

      mockExecuteFunctions.helpers.httpRequest.mockResolvedValue(JSON.stringify({
        jsonrpc: '2.0',
        id: 1,
        result: '0x33B2E3C9FD0803CE8000000'
      }));

      const result = await executeStableTokensOperations.call(mockExecuteFunctions, [{ json: {} }]);

      expect(result).toHaveLength(1);
      expect(result[0].json).toHaveProperty('totalSupply');
      expect(result[0].json).toHaveProperty('tokenAddress');
    });
  });

  describe('allowance operation', () => {
    it('should get allowance successfully', async () => {
      mockExecuteFunctions.getNodeParameter.mockImplementation((param: string) => {
        switch (param) {
          case 'operation': return 'allowance';
          case 'tokenAddress': return '0x765DE816845861e75A25fCA122bb6898B8B1282a';
          case 'owner': return '0x1234567890123456789012345678901234567890';
          case 'spender': return '0x0987654321098765432109876543210987654321';
          default: return undefined;
        }
      });

      mockExecuteFunctions.helpers.httpRequest.mockResolvedValue(JSON.stringify({
        jsonrpc: '2.0',
        id: 1,
        result: '0x0'
      }));

      const result = await executeStableTokensOperations.call(mockExecuteFunctions, [{ json: {} }]);

      expect(result).toHaveLength(1);
      expect(result[0].json).toHaveProperty('allowance');
      expect(result[0].json).toHaveProperty('owner');
      expect(result[0].json).toHaveProperty('spender');
    });
  });

  describe('getTokenInfo operation', () => {
    it('should get token info successfully', async () => {
      mockExecuteFunctions.getNodeParameter.mockImplementation((param: string) => {
        switch (param) {
          case 'operation': return 'getTokenInfo';
          case 'tokenAddress': return '0x765DE816845861e75A25fCA122bb6898B8B1282a';
          default: return undefined;
        }
      });

      mockExecuteFunctions.helpers.httpRequest
        .mockResolvedValueOnce(JSON.stringify({ jsonrpc: '2.0', id: 1, result: '0x43656c6f20446f6c6c617200000000000000000000000000000000000000000000' })) // name
        .mockResolvedValueOnce(JSON.stringify({ jsonrpc: '2.0', id: 2, result: '0x6355534400000000000000000000000000000000000000000000000000000000' })) // symbol
        .mockResolvedValueOnce(JSON.stringify({ jsonrpc: '2.0', id: 3, result: '0x12' })) // decimals
        .mockResolvedValueOnce(JSON.stringify({ jsonrpc: '2.0', id: 4, result: '0x33B2E3C9FD0803CE8000000' })); // totalSupply

      const result = await executeStableTokensOperations.call(mockExecuteFunctions, [{ json: {} }]);

      expect(result).toHaveLength(1);
      expect(result[0].json).toHaveProperty('name');
      expect(result[0].json).toHaveProperty('symbol');
      expect(result[0].json).toHaveProperty('decimals');
      expect(result[0].json).toHaveProperty('totalSupply');
    });
  });

  describe('transfer operation', () => {
    it('should transfer tokens successfully', async () => {
      mockExecuteFunctions.getNodeParameter.mockImplementation((param: string) => {
        switch (param) {
          case 'operation': return 'transfer';
          case 'tokenAddress': return '0x765DE816845861e75A25fCA122bb6898B8B1282a';
          case 'to': return '0x0987654321098765432109876543210987654321';
          case 'value': return '1000000000000000000';
          case 'privateKey': return '0x1234567890abcdef1234567890abcdef1234567890abcdef1234567890abcdef';
          case 'gasLimit': return 100000;
          case 'gasPrice': return '';
          default: return undefined;
        }
      });

      mockExecuteFunctions.helpers.httpRequest
        .mockResolvedValueOnce(JSON.stringify({ jsonrpc: '2.0', id: 1, result: '0x1' })) // nonce
        .mockResolvedValueOnce(JSON.stringify({ jsonrpc: '2.0', id: 2, result: '0x3B9ACA00' })) // gasPrice
        .mockResolvedValueOnce(JSON.stringify({ jsonrpc: '2.0', id: 3, result: '0x1234567890abcdef' })); // txHash

      const result = await executeStableTokensOperations.call(mockExecuteFunctions, [{ json: {} }]);

      expect(result).toHaveLength(1);
      expect(result[0].json).toHaveProperty('transactionHash');
      expect(result[0].json).toHaveProperty('from');
      expect(result[0].json).toHaveProperty('to');
      expect(result[0].json).toHaveProperty('value');
    });
  });
});

describe('Identity Resource', () => {
  let mockExecuteFunctions: any;

  beforeEach(() => {
    mockExecuteFunctions = {
      getNodeParameter: jest.fn(),
      getCredentials: jest.fn().mockResolvedValue({
        apiKey: 'test-api-key',
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

  describe('requestAttestations', () => {
    it('should request phone number attestations successfully', async () => {
      mockExecuteFunctions.getNodeParameter.mockImplementation((paramName: string) => {
        switch (paramName) {
          case 'operation': return 'requestAttestations';
          case 'phoneNumber': return '+1234567890';
          case 'attestationsRequested': return 3;
          case 'privateKey': return '0x1234567890abcdef';
          default: return undefined;
        }
      });

      const mockResponse = {
        jsonrpc: '2.0',
        id: 1,
        result: '0x1234567890abcdef',
      };

      mockExecuteFunctions.helpers.httpRequest.mockResolvedValue(mockResponse);

      const result = await executeIdentityOperations.call(mockExecuteFunctions, [{ json: {} }]);

      expect(result).toHaveLength(1);
      expect(result[0].json).toEqual(mockResponse);
    });

    it('should handle request attestations error', async () => {
      mockExecuteFunctions.getNodeParameter.mockImplementation((paramName: string) => {
        switch (paramName) {
          case 'operation': return 'requestAttestations';
          case 'phoneNumber': return '+1234567890';
          case 'attestationsRequested': return 3;
          case 'privateKey': return '0x1234567890abcdef';
          default: return undefined;
        }
      });

      mockExecuteFunctions.helpers.httpRequest.mockRejectedValue(new Error('Request failed'));
      mockExecuteFunctions.continueOnFail.mockReturnValue(true);

      const result = await executeIdentityOperations.call(mockExecuteFunctions, [{ json: {} }]);

      expect(result).toHaveLength(1);
      expect(result[0].json.error).toBe('Request failed');
    });
  });

  describe('selectIssuers', () => {
    it('should select attestation issuers successfully', async () => {
      mockExecuteFunctions.getNodeParameter.mockImplementation((paramName: string) => {
        switch (paramName) {
          case 'operation': return 'selectIssuers';
          case 'phoneNumber': return '+1234567890';
          case 'attestationsRequested': return 3;
          default: return undefined;
        }
      });

      const mockResponse = {
        jsonrpc: '2.0',
        id: 1,
        result: ['0xissuer1', '0xissuer2', '0xissuer3'],
      };

      mockExecuteFunctions.helpers.httpRequest.mockResolvedValue(mockResponse);

      const result = await executeIdentityOperations.call(mockExecuteFunctions, [{ json: {} }]);

      expect(result).toHaveLength(1);
      expect(result[0].json).toEqual(mockResponse);
    });
  });

  describe('completeAttestations', () => {
    it('should complete attestation process successfully', async () => {
      mockExecuteFunctions.getNodeParameter.mockImplementation((paramName: string) => {
        switch (paramName) {
          case 'operation': return 'completeAttestations';
          case 'phoneNumber': return '+1234567890';
          case 'attestationCode': return '123456';
          default: return undefined;
        }
      });

      const mockResponse = {
        jsonrpc: '2.0',
        id: 1,
        result: '0xtransactionhash',
      };

      mockExecuteFunctions.helpers.httpRequest.mockResolvedValue(mockResponse);

      const result = await executeIdentityOperations.call(mockExecuteFunctions, [{ json: {} }]);

      expect(result).toHaveLength(1);
      expect(result[0].json).toEqual(mockResponse);
    });
  });

  describe('getAttestations', () => {
    it('should get attestation status successfully', async () => {
      mockExecuteFunctions.getNodeParameter.mockImplementation((paramName: string) => {
        switch (paramName) {
          case 'operation': return 'getAttestations';
          case 'phoneNumber': return '+1234567890';
          case 'address': return '0x1234567890abcdef1234567890abcdef12345678';
          default: return undefined;
        }
      });

      const mockResponse = {
        jsonrpc: '2.0',
        id: 1,
        result: {
          completed: 3,
          total: 3,
        },
      };

      mockExecuteFunctions.helpers.httpRequest.mockResolvedValue(mockResponse);

      const result = await executeIdentityOperations.call(mockExecuteFunctions, [{ json: {} }]);

      expect(result).toHaveLength(1);
      expect(result[0].json).toEqual(mockResponse);
    });
  });

  describe('getAccountMetadata', () => {
    it('should get account metadata successfully', async () => {
      mockExecuteFunctions.getNodeParameter.mockImplementation((paramName: string) => {
        switch (paramName) {
          case 'operation': return 'getAccountMetadata';
          case 'address': return '0x1234567890abcdef1234567890abcdef12345678';
          default: return undefined;
        }
      });

      const mockResponse = {
        jsonrpc: '2.0',
        id: 1,
        result: 'https://example.com/metadata.json',
      };

      mockExecuteFunctions.helpers.httpRequest.mockResolvedValue(mockResponse);

      const result = await executeIdentityOperations.call(mockExecuteFunctions, [{ json: {} }]);

      expect(result).toHaveLength(1);
      expect(result[0].json).toEqual(mockResponse);
    });
  });

  describe('setAccountMetadata', () => {
    it('should set account metadata successfully', async () => {
      mockExecuteFunctions.getNodeParameter.mockImplementation((paramName: string) => {
        switch (paramName) {
          case 'operation': return 'setAccountMetadata';
          case 'metadataURL': return 'https://example.com/metadata.json';
          case 'privateKey': return '0x1234567890abcdef';
          default: return undefined;
        }
      });

      const mockResponse = {
        jsonrpc: '2.0',
        id: 1,
        result: '0xtransactionhash',
      };

      mockExecuteFunctions.helpers.httpRequest.mockResolvedValue(mockResponse);

      const result = await executeIdentityOperations.call(mockExecuteFunctions, [{ json: {} }]);

      expect(result).toHaveLength(1);
      expect(result[0].json).toEqual(mockResponse);
    });
  });
});

describe('ValidatorStaking Resource', () => {
  let mockExecuteFunctions: any;

  beforeEach(() => {
    mockExecuteFunctions = {
      getNodeParameter: jest.fn(),
      getCredentials: jest.fn().mockResolvedValue({
        apiKey: 'test-api-key',
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

  test('should execute vote operation successfully', async () => {
    mockExecuteFunctions.getNodeParameter.mockImplementation((paramName: string, index: number) => {
      if (paramName === 'operation') return 'vote';
      if (paramName === 'group') return '0x1234567890123456789012345678901234567890';
      if (paramName === 'value') return '1000000000000000000';
      if (paramName === 'privateKey') return '0xprivatekey123';
      return undefined;
    });

    const mockResponse = {
      jsonrpc: '2.0',
      id: '1',
      result: '0xtransactionhash123',
    };

    mockExecuteFunctions.helpers.httpRequest.mockResolvedValue(mockResponse);

    const result = await executeValidatorStakingOperations.call(
      mockExecuteFunctions,
      [{ json: {} }],
    );

    expect(result).toHaveLength(1);
    expect(result[0].json).toEqual(mockResponse);
    expect(mockExecuteFunctions.helpers.httpRequest).toHaveBeenCalledWith({
      method: 'POST',
      url: 'https://forno.celo.org',
      headers: {
        'Content-Type': 'application/json',
      },
      body: expect.objectContaining({
        jsonrpc: '2.0',
        method: 'eth_sendTransaction',
      }),
      json: true,
    });
  });

  test('should execute getElectedValidators operation successfully', async () => {
    mockExecuteFunctions.getNodeParameter.mockImplementation((paramName: string, index: number) => {
      if (paramName === 'operation') return 'getElectedValidators';
      return undefined;
    });

    const mockResponse = {
      jsonrpc: '2.0',
      id: '1',
      result: ['0xvalidator1', '0xvalidator2'],
    };

    mockExecuteFunctions.helpers.httpRequest.mockResolvedValue(mockResponse);

    const result = await executeValidatorStakingOperations.call(
      mockExecuteFunctions,
      [{ json: {} }],
    );

    expect(result).toHaveLength(1);
    expect(result[0].json).toEqual(mockResponse);
  });

  test('should handle errors when continueOnFail is true', async () => {
    mockExecuteFunctions.getNodeParameter.mockImplementation((paramName: string) => {
      if (paramName === 'operation') return 'vote';
      throw new Error('Parameter error');
    });

    mockExecuteFunctions.continueOnFail.mockReturnValue(true);

    const result = await executeValidatorStakingOperations.call(
      mockExecuteFunctions,
      [{ json: {} }],
    );

    expect(result).toHaveLength(1);
    expect(result[0].json.error).toBe('Parameter error');
  });

  test('should execute lock operation successfully', async () => {
    mockExecuteFunctions.getNodeParameter.mockImplementation((paramName: string) => {
      if (paramName === 'operation') return 'lock';
      if (paramName === 'value') return '2000000000000000000';
      if (paramName === 'privateKey') return '0xprivatekey456';
      return undefined;
    });

    const mockResponse = {
      jsonrpc: '2.0',
      id: '1',
      result: '0xlocktransactionhash',
    };

    mockExecuteFunctions.helpers.httpRequest.mockResolvedValue(mockResponse);

    const result = await executeValidatorStakingOperations.call(
      mockExecuteFunctions,
      [{ json: {} }],
    );

    expect(result).toHaveLength(1);
    expect(result[0].json).toEqual(mockResponse);
  });
});

describe('Governance Resource', () => {
  let mockExecuteFunctions: any;

  beforeEach(() => {
    mockExecuteFunctions = {
      getNodeParameter: jest.fn(),
      getCredentials: jest.fn().mockResolvedValue({
        apiKey: 'test-api-key',
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

  test('should submit governance proposal successfully', async () => {
    mockExecuteFunctions.getNodeParameter.mockImplementation((paramName: string) => {
      switch (paramName) {
        case 'operation': return 'propose';
        case 'values': return ['100'];
        case 'destinations': return ['0x123...'];
        case 'data': return ['0x'];
        case 'descriptionURL': return 'https://example.com/proposal';
        case 'privateKey': return '0xprivatekey123';
        default: return '';
      }
    });

    const mockResponse = {
      result: '0x1234567890abcdef',
    };

    mockExecuteFunctions.helpers.httpRequest.mockResolvedValue(mockResponse);

    const result = await executeGovernanceOperations.call(
      mockExecuteFunctions,
      [{ json: {} }]
    );

    expect(result).toHaveLength(1);
    expect(result[0].json).toEqual(mockResponse.result);
    expect(mockExecuteFunctions.helpers.httpRequest).toHaveBeenCalledWith(
      expect.objectContaining({
        method: 'POST',
        body: expect.objectContaining({
          method: 'eth_sendRawTransaction',
        }),
      })
    );
  });

  test('should vote on proposal successfully', async () => {
    mockExecuteFunctions.getNodeParameter.mockImplementation((paramName: string) => {
      switch (paramName) {
        case 'operation': return 'vote';
        case 'proposalId': return '123';
        case 'vote': return '1';
        case 'privateKey': return '0xprivatekey123';
        default: return '';
      }
    });

    const mockResponse = {
      result: '0x987654321',
    };

    mockExecuteFunctions.helpers.httpRequest.mockResolvedValue(mockResponse);

    const result = await executeGovernanceOperations.call(
      mockExecuteFunctions,
      [{ json: {} }]
    );

    expect(result).toHaveLength(1);
    expect(result[0].json).toEqual(mockResponse.result);
  });

  test('should get proposal details successfully', async () => {
    mockExecuteFunctions.getNodeParameter.mockImplementation((paramName: string) => {
      switch (paramName) {
        case 'operation': return 'getProposal';
        case 'proposalId': return '123';
        default: return '';
      }
    });

    const mockResponse = {
      result: {
        id: '123',
        proposer: '0x123...',
        status: 'active',
        description: 'Test proposal',
      },
    };

    mockExecuteFunctions.helpers.httpRequest.mockResolvedValue(mockResponse);

    const result = await executeGovernanceOperations.call(
      mockExecuteFunctions,
      [{ json: {} }]
    );

    expect(result).toHaveLength(1);
    expect(result[0].json).toEqual(mockResponse.result);
  });

  test('should get all proposals successfully', async () => {
    mockExecuteFunctions.getNodeParameter.mockImplementation((paramName: string) => {
      switch (paramName) {
        case 'operation': return 'getProposals';
        default: return '';
      }
    });

    const mockResponse = {
      result: [
        { id: '1', status: 'active' },
        { id: '2', status: 'executed' },
      ],
    };

    mockExecuteFunctions.helpers.httpRequest.mockResolvedValue(mockResponse);

    const result = await executeGovernanceOperations.call(
      mockExecuteFunctions,
      [{ json: {} }]
    );

    expect(result).toHaveLength(1);
    expect(result[0].json).toEqual(mockResponse.result);
  });

  test('should execute approved proposal successfully', async () => {
    mockExecuteFunctions.getNodeParameter.mockImplementation((paramName: string) => {
      switch (paramName) {
        case 'operation': return 'execute';
        case 'proposalId': return '123';
        case 'privateKey': return '0xprivatekey123';
        default: return '';
      }
    });

    const mockResponse = {
      result: '0xexecutiontx123',
    };

    mockExecuteFunctions.helpers.httpRequest.mockResolvedValue(mockResponse);

    const result = await executeGovernanceOperations.call(
      mockExecuteFunctions,
      [{ json: {} }]
    );

    expect(result).toHaveLength(1);
    expect(result[0].json).toEqual(mockResponse.result);
  });

  test('should get vote record successfully', async () => {
    mockExecuteFunctions.getNodeParameter.mockImplementation((paramName: string) => {
      switch (paramName) {
        case 'operation': return 'getVoteRecord';
        case 'address': return '0x123...';
        case 'proposalId': return '123';
        default: return '';
      }
    });

    const mockResponse = {
      result: {
        vote: '1',
        weight: '1000000000000000000',
      },
    };

    mockExecuteFunctions.helpers.httpRequest.mockResolvedValue(mockResponse);

    const result = await executeGovernanceOperations.call(
      mockExecuteFunctions,
      [{ json: {} }]
    );

    expect(result).toHaveLength(1);
    expect(result[0].json).toEqual(mockResponse.result);
  });

  test('should handle API errors gracefully', async () => {
    mockExecuteFunctions.getNodeParameter.mockImplementation((paramName: string) => {
      switch (paramName) {
        case 'operation': return 'getProposal';
        case 'proposalId': return '999';
        default: return '';
      }
    });

    const errorResponse = {
      error: {
        code: -32000,
        message: 'Proposal not found',
      },
    };

    mockExecuteFunctions.helpers.httpRequest.mockResolvedValue(errorResponse);
    mockExecuteFunctions.continueOnFail.mockReturnValue(true);

    const result = await executeGovernanceOperations.call(
      mockExecuteFunctions,
      [{ json: {} }]
    );

    expect(result).toHaveLength(1);
    expect(result[0].json.error).toBeDefined();
  });

  test('should throw error for unknown operation', async () => {
    mockExecuteFunctions.getNodeParameter.mockImplementation((paramName: string) => {
      switch (paramName) {
        case 'operation': return 'unknownOperation';
        default: return '';
      }
    });

    await expect(
      executeGovernanceOperations.call(mockExecuteFunctions, [{ json: {} }])
    ).rejects.toThrow('Unknown operation: unknownOperation');
  });
});

describe('Exchange Resource', () => {
  let mockExecuteFunctions: any;

  beforeEach(() => {
    mockExecuteFunctions = {
      getNodeParameter: jest.fn(),
      getCredentials: jest.fn().mockResolvedValue({
        apiKey: 'test-api-key',
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

  test('should exchange CELO for cUSD successfully', async () => {
    mockExecuteFunctions.getNodeParameter.mockImplementation((paramName: string) => {
      const params: any = {
        operation: 'exchange',
        sellAmount: '1000000000000000000',
        minBuyAmount: '900000000000000000',
        sellToken: 'CELO',
        buyToken: 'cUSD',
        privateKey: '0x1234567890abcdef',
      };
      return params[paramName];
    });

    const mockResponse = {
      jsonrpc: '2.0',
      id: 1,
      result: '0x1234567890abcdef1234567890abcdef12345678',
    };

    mockExecuteFunctions.helpers.httpRequest
      .mockResolvedValueOnce({ result: '0x1' }) // nonce
      .mockResolvedValueOnce(mockResponse); // transaction

    const items = [{ json: {} }];
    const result = await executeExchangeOperations.call(mockExecuteFunctions, items);

    expect(result).toHaveLength(1);
    expect(result[0].json).toEqual(mockResponse);
  });

  test('should get exchange rate successfully', async () => {
    mockExecuteFunctions.getNodeParameter.mockImplementation((paramName: string) => {
      const params: any = {
        operation: 'getExchangeRate',
        sellToken: 'CELO',
        buyToken: 'cUSD',
        sellAmount: '1000000000000000000',
      };
      return params[paramName];
    });

    const mockResponse = {
      jsonrpc: '2.0',
      id: 1,
      result: '0x0de0b6b3a7640000',
    };

    mockExecuteFunctions.helpers.httpRequest.mockResolvedValue(mockResponse);

    const items = [{ json: {} }];
    const result = await executeExchangeOperations.call(mockExecuteFunctions, items);

    expect(result).toHaveLength(1);
    expect(result[0].json).toEqual(mockResponse);
  });

  test('should get buy token amount successfully', async () => {
    mockExecuteFunctions.getNodeParameter.mockImplementation((paramName: string) => {
      const params: any = {
        operation: 'getBuyTokenAmount',
        sellToken: 'CELO',
        buyToken: 'cUSD',
        sellAmount: '1000000000000000000',
      };
      return params[paramName];
    });

    const mockResponse = {
      jsonrpc: '2.0',
      id: 1,
      result: '0x0de0b6b3a7640000',
    };

    mockExecuteFunctions.helpers.httpRequest.mockResolvedValue(mockResponse);

    const items = [{ json: {} }];
    const result = await executeExchangeOperations.call(mockExecuteFunctions, items);

    expect(result).toHaveLength(1);
    expect(result[0].json).toEqual(mockResponse);
  });

  test('should get reserves successfully', async () => {
    mockExecuteFunctions.getNodeParameter.mockImplementation((paramName: string) => {
      const params: any = {
        operation: 'getReserves',
      };
      return params[paramName];
    });

    const mockResponse = {
      jsonrpc: '2.0',
      id: 1,
      result: '0x0000000000000000000000000000000000000000000000000de0b6b3a7640000',
    };

    mockExecuteFunctions.helpers.httpRequest.mockResolvedValue(mockResponse);

    const items = [{ json: {} }];
    const result = await executeExchangeOperations.call(mockExecuteFunctions, items);

    expect(result).toHaveLength(1);
    expect(result[0].json).toEqual(mockResponse);
  });

  test('should handle errors properly', async () => {
    mockExecuteFunctions.getNodeParameter.mockImplementation((paramName: string) => {
      const params: any = {
        operation: 'getExchangeRate',
        sellToken: 'CELO',
        buyToken: 'cUSD',
        sellAmount: '1000000000000000000',
      };
      return params[paramName];
    });

    mockExecuteFunctions.helpers.httpRequest.mockRejectedValue(new Error('Network error'));
    mockExecuteFunctions.continueOnFail.mockReturnValue(true);

    const items = [{ json: {} }];
    const result = await executeExchangeOperations.call(mockExecuteFunctions, items);

    expect(result).toHaveLength(1);
    expect(result[0].json.error).toBe('Network error');
  });
});
});
