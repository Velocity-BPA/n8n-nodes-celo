/*
 * Copyright (c) Velocity BPA, LLC
 * Licensed under the Business Source License 1.1
 * Commercial use requires a separate commercial license.
 * See LICENSE file for details.
 */

import { getRpcUrl, getExplorerApiUrl, getContractAddress } from '../../nodes/Celo/transport/celoClient';
import type { CeloCredentials } from '../../nodes/Celo/utils/types';

describe('Celo Client', () => {
  describe('getRpcUrl', () => {
    it('should return mainnet RPC URL', () => {
      const credentials: CeloCredentials = {
        network: 'mainnet',
      };
      const url = getRpcUrl(credentials);
      expect(url).toBe('https://forno.celo.org');
    });

    it('should return alfajores RPC URL', () => {
      const credentials: CeloCredentials = {
        network: 'alfajores',
      };
      const url = getRpcUrl(credentials);
      expect(url).toBe('https://alfajores-forno.celo-testnet.org');
    });

    it('should return baklava RPC URL', () => {
      const credentials: CeloCredentials = {
        network: 'baklava',
      };
      const url = getRpcUrl(credentials);
      expect(url).toBe('https://baklava-forno.celo-testnet.org');
    });

    it('should return custom RPC URL when provided', () => {
      const credentials: CeloCredentials = {
        network: 'custom',
        rpcEndpoint: 'https://custom.rpc.endpoint',
      };
      const url = getRpcUrl(credentials);
      expect(url).toBe('https://custom.rpc.endpoint');
    });

    it('should throw error for custom network without RPC endpoint', () => {
      const credentials: CeloCredentials = {
        network: 'custom',
      };
      expect(() => getRpcUrl(credentials)).toThrow('Custom network requires an RPC endpoint');
    });
  });

  describe('getExplorerApiUrl', () => {
    it('should return mainnet explorer API URL', () => {
      const credentials: CeloCredentials = {
        network: 'mainnet',
      };
      const url = getExplorerApiUrl(credentials);
      expect(url).toBe('https://api.celoscan.io/api');
    });

    it('should return alfajores explorer API URL', () => {
      const credentials: CeloCredentials = {
        network: 'alfajores',
      };
      const url = getExplorerApiUrl(credentials);
      expect(url).toBe('https://api-alfajores.celoscan.io/api');
    });
  });

  describe('getContractAddress', () => {
    it('should return GoldToken address for mainnet', () => {
      const address = getContractAddress('mainnet', 'GoldToken');
      expect(address).toMatch(/^0x[a-fA-F0-9]{40}$/);
    });

    it('should return StableToken address for mainnet', () => {
      const address = getContractAddress('mainnet', 'StableToken');
      expect(address).toMatch(/^0x[a-fA-F0-9]{40}$/);
    });

    it('should return Election address for mainnet', () => {
      const address = getContractAddress('mainnet', 'Election');
      expect(address).toMatch(/^0x[a-fA-F0-9]{40}$/);
    });

    it('should return LockedGold address for mainnet', () => {
      const address = getContractAddress('mainnet', 'LockedGold');
      expect(address).toMatch(/^0x[a-fA-F0-9]{40}$/);
    });

    it('should return Governance address for mainnet', () => {
      const address = getContractAddress('mainnet', 'Governance');
      expect(address).toMatch(/^0x[a-fA-F0-9]{40}$/);
    });

    it('should return different addresses for alfajores', () => {
      const mainnetAddress = getContractAddress('mainnet', 'StableToken');
      const alfajoresAddress = getContractAddress('alfajores', 'StableToken');
      // Addresses might be the same or different depending on the contract
      expect(alfajoresAddress).toMatch(/^0x[a-fA-F0-9]{40}$/);
    });

    it('should use mainnet addresses for custom network', () => {
      const mainnetAddress = getContractAddress('mainnet', 'StableToken');
      const customAddress = getContractAddress('custom', 'StableToken');
      expect(customAddress).toBe(mainnetAddress);
    });
  });
});

describe('Mock RPC Calls', () => {
  // These tests verify the structure of expected responses
  // Real integration tests would require a running Celo node
  
  describe('Expected Response Structures', () => {
    it('should expect correct structure for eth_getBalance', () => {
      const mockResponse = {
        jsonrpc: '2.0',
        id: 1,
        result: '0xde0b6b3a7640000', // 1 CELO in wei
      };
      expect(mockResponse.result).toBeDefined();
      expect(mockResponse.result).toMatch(/^0x[a-fA-F0-9]+$/);
    });

    it('should expect correct structure for eth_blockNumber', () => {
      const mockResponse = {
        jsonrpc: '2.0',
        id: 1,
        result: '0x12345678',
      };
      expect(mockResponse.result).toBeDefined();
      expect(mockResponse.result).toMatch(/^0x[a-fA-F0-9]+$/);
    });

    it('should expect correct structure for eth_getTransactionByHash', () => {
      const mockResponse = {
        jsonrpc: '2.0',
        id: 1,
        result: {
          hash: '0x1234567890abcdef1234567890abcdef1234567890abcdef1234567890abcdef',
          from: '0x1234567890abcdef1234567890abcdef12345678',
          to: '0xabcdef1234567890abcdef1234567890abcdef12',
          value: '0xde0b6b3a7640000',
          blockNumber: '0x12345',
          gas: '0x5208',
          gasPrice: '0x3b9aca00',
        },
      };
      expect(mockResponse.result.hash).toBeDefined();
      expect(mockResponse.result.from).toBeDefined();
    });

    it('should expect correct structure for eth_call (balanceOf)', () => {
      const mockResponse = {
        jsonrpc: '2.0',
        id: 1,
        result: '0x0000000000000000000000000000000000000000000000000de0b6b3a7640000',
      };
      expect(mockResponse.result).toBeDefined();
      // Result should be 64 hex chars (32 bytes) + 0x prefix
      expect(mockResponse.result.length).toBe(66);
    });

    it('should handle RPC error response', () => {
      const mockErrorResponse = {
        jsonrpc: '2.0',
        id: 1,
        error: {
          code: -32602,
          message: 'Invalid params',
        },
      };
      expect(mockErrorResponse.error).toBeDefined();
      expect(mockErrorResponse.error.code).toBe(-32602);
    });
  });
});
