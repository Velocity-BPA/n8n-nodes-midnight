/*
 * Copyright (c) Velocity BPA, LLC
 * Licensed under the Business Source License 1.1
 * Commercial use requires a separate commercial license.
 * See LICENSE file for details.
 */

import {
  validateBlockHash,
  validateTransactionHash,
  validateContractAddress,
  validateStakeKey,
  validateProofId,
  parsePaginationParams,
  parseBlockHeight,
  formatTimestamp,
  transformToOutput,
  wrapInArray,
  prepareGraphQLVariables,
} from '../../nodes/Midnight/utils';

describe('Utils', () => {
  describe('validateBlockHash', () => {
    it('should accept valid block hash with 0x prefix', () => {
      const hash = '0x' + 'a'.repeat(64);
      expect(validateBlockHash(hash)).toBe(hash);
    });

    it('should add 0x prefix if missing', () => {
      const hash = 'a'.repeat(64);
      expect(validateBlockHash(hash)).toBe('0x' + hash);
    });

    it('should throw for invalid hash length', () => {
      expect(() => validateBlockHash('0x123')).toThrow('Invalid block hash format');
    });

    it('should throw for non-hex characters', () => {
      const hash = '0x' + 'g'.repeat(64);
      expect(() => validateBlockHash(hash)).toThrow('Invalid block hash format');
    });
  });

  describe('validateTransactionHash', () => {
    it('should accept valid transaction hash', () => {
      const hash = '0x' + 'b'.repeat(64);
      expect(validateTransactionHash(hash)).toBe(hash);
    });

    it('should throw for invalid hash', () => {
      expect(() => validateTransactionHash('invalid')).toThrow(
        'Invalid transaction hash format',
      );
    });
  });

  describe('validateContractAddress', () => {
    it('should accept valid contract address (40 chars)', () => {
      const address = '0x' + 'c'.repeat(40);
      expect(validateContractAddress(address)).toBe(address);
    });

    it('should accept valid contract address (64 chars)', () => {
      const address = '0x' + 'd'.repeat(64);
      expect(validateContractAddress(address)).toBe(address);
    });

    it('should throw for invalid address', () => {
      expect(() => validateContractAddress('invalid')).toThrow(
        'Invalid contract address format',
      );
    });
  });

  describe('validateStakeKey', () => {
    it('should accept valid stake key', () => {
      const stakeKey = 'stake1uxxxxxxxxxxxxxxxxxxx';
      expect(validateStakeKey(stakeKey)).toBe(stakeKey);
    });

    it('should throw for empty stake key', () => {
      expect(() => validateStakeKey('')).toThrow('Invalid stake key format');
    });

    it('should throw for too short stake key', () => {
      expect(() => validateStakeKey('short')).toThrow('Invalid stake key format');
    });
  });

  describe('validateProofId', () => {
    it('should accept valid proof ID', () => {
      const proofId = 'proof-123-abc';
      expect(validateProofId(proofId)).toBe(proofId);
    });

    it('should throw for empty proof ID', () => {
      expect(() => validateProofId('')).toThrow('Proof ID cannot be empty');
    });
  });

  describe('parsePaginationParams', () => {
    it('should return default values when not provided', () => {
      const result = parsePaginationParams();
      expect(result.limit).toBe(25);
      expect(result.offset).toBe(0);
    });

    it('should respect provided values', () => {
      const result = parsePaginationParams(50, 10);
      expect(result.limit).toBe(50);
      expect(result.offset).toBe(10);
    });

    it('should cap limit at maximum', () => {
      const result = parsePaginationParams(200, 0);
      expect(result.limit).toBe(100);
    });

    it('should ensure minimum limit of 1', () => {
      const result = parsePaginationParams(-5, 0);
      expect(result.limit).toBe(1);
    });

    it('should ensure non-negative offset', () => {
      const result = parsePaginationParams(25, -10);
      expect(result.offset).toBe(0);
    });
  });

  describe('parseBlockHeight', () => {
    it('should parse number correctly', () => {
      expect(parseBlockHeight(100)).toBe(100);
    });

    it('should parse string correctly', () => {
      expect(parseBlockHeight('200')).toBe(200);
    });

    it('should throw for negative height', () => {
      expect(() => parseBlockHeight(-1)).toThrow('Invalid block height');
    });

    it('should throw for non-numeric string', () => {
      expect(() => parseBlockHeight('abc')).toThrow('Invalid block height');
    });
  });

  describe('formatTimestamp', () => {
    it('should return ISO string for number', () => {
      const timestamp = 1704067200000;
      const result = formatTimestamp(timestamp);
      expect(result).toMatch(/^\d{4}-\d{2}-\d{2}T/);
    });

    it('should return string as-is', () => {
      const timestamp = '2024-01-01T00:00:00Z';
      expect(formatTimestamp(timestamp)).toBe(timestamp);
    });
  });

  describe('transformToOutput', () => {
    it('should transform single object', () => {
      const input = { foo: 'bar', count: 42 };
      const result = transformToOutput(input);
      expect(result).toEqual({ foo: 'bar', count: 42 });
    });

    it('should transform array', () => {
      const input = [{ id: 1 }, { id: 2 }];
      const result = transformToOutput(input);
      expect(result).toEqual([{ id: 1 }, { id: 2 }]);
    });

    it('should handle null values', () => {
      const result = transformToOutput(null);
      expect(result).toEqual({});
    });

    it('should handle nested objects', () => {
      const input = { outer: { inner: 'value' } };
      const result = transformToOutput(input);
      expect(result).toEqual({ outer: { inner: 'value' } });
    });
  });

  describe('wrapInArray', () => {
    it('should wrap non-array in array', () => {
      expect(wrapInArray('test')).toEqual(['test']);
    });

    it('should return array as-is', () => {
      expect(wrapInArray([1, 2, 3])).toEqual([1, 2, 3]);
    });
  });

  describe('prepareGraphQLVariables', () => {
    it('should remove undefined values', () => {
      const input = { a: 'value', b: undefined, c: null };
      const result = prepareGraphQLVariables(input);
      expect(result).toEqual({ a: 'value' });
    });

    it('should remove empty strings', () => {
      const input = { a: 'value', b: '' };
      const result = prepareGraphQLVariables(input);
      expect(result).toEqual({ a: 'value' });
    });

    it('should keep zero and false values', () => {
      const input = { a: 0, b: false };
      const result = prepareGraphQLVariables(input);
      expect(result).toEqual({ a: 0, b: false });
    });
  });
});
