/*
 * Copyright (c) Velocity BPA, LLC
 * Licensed under the Business Source License 1.1
 * Commercial use requires a separate commercial license.
 * See LICENSE file for details.
 */

import {
  normalizePhoneNumber,
  hashPhoneNumber,
  getStablecoinAddress,
  getFeeCurrencyOptions,
  convertUnits,
  parseTokenAmount,
  formatTokenAmount,
  calculatePercentage,
  formatAddress,
  truncateAddress,
  calculateEpochFromBlock,
  getEpochBoundaries,
  decodeUint256,
  decodeAddress,
  decodeBool,
  isHex,
  toHex,
  fromHex,
} from '../../nodes/Celo/utils/helpers';

describe('Phone Number Functions', () => {
  describe('normalizePhoneNumber', () => {
    it('should normalize a US phone number without country code', () => {
      expect(normalizePhoneNumber('5551234567')).toBe('+15551234567');
    });

    it('should keep existing + prefix', () => {
      expect(normalizePhoneNumber('+15551234567')).toBe('+15551234567');
    });

    it('should remove non-numeric characters', () => {
      expect(normalizePhoneNumber('(555) 123-4567')).toBe('+15551234567');
    });

    it('should handle international numbers', () => {
      expect(normalizePhoneNumber('+44 20 7946 0958')).toBe('+442079460958');
    });
  });

  describe('hashPhoneNumber', () => {
    it('should return a hash object with original and hash', () => {
      const result = hashPhoneNumber('+15551234567');
      expect(result.original).toBe('+15551234567');
      expect(result.hash).toMatch(/^0x[a-f0-9]{64}$/);
    });

    it('should include pepper when provided', () => {
      const result = hashPhoneNumber('+15551234567', 'testPepper');
      expect(result.pepper).toBe('testPepper');
    });

    it('should produce different hashes with different peppers', () => {
      const hash1 = hashPhoneNumber('+15551234567', 'pepper1');
      const hash2 = hashPhoneNumber('+15551234567', 'pepper2');
      expect(hash1.hash).not.toBe(hash2.hash);
    });
  });
});

describe('Stablecoin Functions', () => {
  describe('getStablecoinAddress', () => {
    it('should return mainnet address for cUSD', () => {
      const address = getStablecoinAddress('cUSD', 'mainnet');
      expect(address).toMatch(/^0x[a-fA-F0-9]{40}$/);
    });

    it('should return alfajores address for testnet', () => {
      const address = getStablecoinAddress('cUSD', 'alfajores');
      expect(address).toMatch(/^0x[a-fA-F0-9]{40}$/);
    });

    it('should throw for unknown stablecoin', () => {
      expect(() => getStablecoinAddress('UNKNOWN' as any, 'mainnet')).toThrow('Unknown stablecoin');
    });
  });

  describe('getFeeCurrencyOptions', () => {
    it('should return fee currency options for mainnet', () => {
      const options = getFeeCurrencyOptions('mainnet');
      expect(options).toHaveLength(4);
      expect(options[0].symbol).toBe('CELO');
      expect(options[1].symbol).toBe('cUSD');
    });

    it('should return fee currency options for alfajores', () => {
      const options = getFeeCurrencyOptions('alfajores');
      expect(options).toHaveLength(4);
    });
  });
});

describe('Unit Conversion Functions', () => {
  describe('convertUnits', () => {
    it('should convert wei to all units', () => {
      const result = convertUnits('1000000000000000000', 'wei');
      expect(result.wei).toBe('1000000000000000000');
      expect(result.gwei).toBe('1000000000');
      expect(result.celo).toBe('1');
    });

    it('should convert gwei to all units', () => {
      const result = convertUnits('1000000000', 'gwei');
      expect(result.wei).toBe('1000000000000000000');
      expect(result.celo).toBe('1');
    });

    it('should convert celo to all units', () => {
      const result = convertUnits('1', 'celo');
      expect(result.wei).toBe('1000000000000000000');
      expect(result.gwei).toBe('1000000000');
    });

    it('should throw for unknown unit', () => {
      expect(() => convertUnits('1', 'unknown' as any)).toThrow('Unknown unit');
    });
  });

  describe('parseTokenAmount', () => {
    it('should parse integer amount', () => {
      expect(parseTokenAmount('100')).toBe('100000000000000000000');
    });

    it('should parse decimal amount', () => {
      expect(parseTokenAmount('1.5')).toBe('1500000000000000000');
    });

    it('should handle small decimals', () => {
      expect(parseTokenAmount('0.1')).toBe('100000000000000000');
    });

    it('should handle custom decimals', () => {
      expect(parseTokenAmount('100', 6)).toBe('100000000');
    });
  });

  describe('formatTokenAmount', () => {
    it('should format wei amount to CELO', () => {
      expect(formatTokenAmount('1000000000000000000')).toBe('1');
    });

    it('should format with decimals', () => {
      expect(formatTokenAmount('1500000000000000000')).toBe('1.5');
    });

    it('should handle zero', () => {
      expect(formatTokenAmount('0')).toBe('0');
    });

    it('should handle custom decimals', () => {
      expect(formatTokenAmount('1000000', 6)).toBe('1');
    });
  });
});

describe('Calculation Functions', () => {
  describe('calculatePercentage', () => {
    it('should calculate percentage correctly', () => {
      expect(calculatePercentage('50', '100')).toBe('50.00');
    });

    it('should handle decimal percentages', () => {
      expect(calculatePercentage('1', '3')).toBe('33.33');
    });

    it('should return 0 for zero total', () => {
      expect(calculatePercentage('50', '0')).toBe('0');
    });
  });
});

describe('Address Functions', () => {
  describe('formatAddress', () => {
    it('should lowercase valid address', () => {
      const address = '0xABCDEF1234567890ABCDEF1234567890ABCDEF12';
      expect(formatAddress(address)).toBe(address.toLowerCase());
    });

    it('should throw for invalid address', () => {
      expect(() => formatAddress('invalid')).toThrow('Invalid address format');
    });

    it('should throw for wrong length', () => {
      expect(() => formatAddress('0x1234')).toThrow('Invalid address format');
    });
  });

  describe('truncateAddress', () => {
    it('should truncate address with default chars', () => {
      const address = '0xABCDEF1234567890ABCDEF1234567890ABCDEF12';
      expect(truncateAddress(address)).toBe('0xABCDEF...CDEF12');
    });

    it('should truncate with custom chars', () => {
      const address = '0xABCDEF1234567890ABCDEF1234567890ABCDEF12';
      expect(truncateAddress(address, 4)).toBe('0xABCD...EF12');
    });
  });
});

describe('Epoch Functions', () => {
  describe('calculateEpochFromBlock', () => {
    it('should calculate epoch from block number', () => {
      expect(calculateEpochFromBlock(17280)).toBe(1);
      expect(calculateEpochFromBlock(34560)).toBe(2);
    });

    it('should handle hex block numbers', () => {
      expect(calculateEpochFromBlock('0x4380')).toBe(1); // 17280 in hex
    });
  });

  describe('getEpochBoundaries', () => {
    it('should return correct boundaries for epoch 0', () => {
      const bounds = getEpochBoundaries(0);
      expect(bounds.firstBlock).toBe(0);
      expect(bounds.lastBlock).toBe(17279);
    });

    it('should return correct boundaries for epoch 1', () => {
      const bounds = getEpochBoundaries(1);
      expect(bounds.firstBlock).toBe(17280);
      expect(bounds.lastBlock).toBe(34559);
    });
  });
});

describe('Decoding Functions', () => {
  describe('decodeUint256', () => {
    it('should decode hex to string number', () => {
      expect(decodeUint256('0x64')).toBe('100');
    });

    it('should handle large numbers', () => {
      expect(decodeUint256('0xde0b6b3a7640000')).toBe('1000000000000000000');
    });
  });

  describe('decodeAddress', () => {
    it('should decode padded address', () => {
      const padded = '0x000000000000000000000000abcdef1234567890abcdef1234567890abcdef12';
      expect(decodeAddress(padded)).toBe('0xabcdef1234567890abcdef1234567890abcdef12');
    });
  });

  describe('decodeBool', () => {
    it('should decode true', () => {
      expect(decodeBool('0x0000000000000000000000000000000000000000000000000000000000000001')).toBe(true);
    });

    it('should decode false', () => {
      expect(decodeBool('0x0000000000000000000000000000000000000000000000000000000000000000')).toBe(false);
    });
  });
});

describe('Hex Functions', () => {
  describe('isHex', () => {
    it('should return true for valid hex', () => {
      expect(isHex('0x1234abcd')).toBe(true);
    });

    it('should return false for invalid hex', () => {
      expect(isHex('1234abcd')).toBe(false);
      expect(isHex('0xGHIJ')).toBe(false);
    });
  });

  describe('toHex', () => {
    it('should convert number to hex', () => {
      expect(toHex(100)).toBe('0x64');
    });

    it('should convert string number to hex', () => {
      expect(toHex('100')).toBe('0x64');
    });

    it('should return hex strings as-is', () => {
      expect(toHex('0x64')).toBe('0x64');
    });
  });

  describe('fromHex', () => {
    it('should convert hex to bigint', () => {
      expect(fromHex('0x64')).toBe(BigInt(100));
    });
  });
});
