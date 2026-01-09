/*
 * Copyright (c) Velocity BPA, LLC
 * Licensed under the Business Source License 1.1
 * Commercial use requires a separate commercial license.
 * See LICENSE file for details.
 */

import {
  PAGINATION,
  NETWORKS,
  TRANSACTION_STATUS,
  TRANSACTION_TYPE,
  PROOF_STATUS,
  REQUEST_TIMEOUT,
  WS_TIMEOUT,
  POLLING_INTERVALS,
  RPC_ERROR_CODES,
} from '../../nodes/Midnight/constants';

describe('Constants', () => {
  describe('PAGINATION', () => {
    it('should have correct default values', () => {
      expect(PAGINATION.DEFAULT_LIMIT).toBe(25);
      expect(PAGINATION.MAX_LIMIT).toBe(100);
      expect(PAGINATION.DEFAULT_OFFSET).toBe(0);
    });
  });

  describe('NETWORKS', () => {
    it('should have testnet configuration', () => {
      expect(NETWORKS.testnet).toBeDefined();
      expect(NETWORKS.testnet.name).toBe('Testnet');
      expect(NETWORKS.testnet.indexerUrl).toContain('testnet');
      expect(NETWORKS.testnet.rpcUrl).toContain('testnet');
    });

    it('should have mainnet configuration', () => {
      expect(NETWORKS.mainnet).toBeDefined();
      expect(NETWORKS.mainnet.name).toBe('Mainnet');
      expect(NETWORKS.mainnet.indexerUrl).not.toContain('testnet');
    });
  });

  describe('TRANSACTION_STATUS', () => {
    it('should have all statuses defined', () => {
      expect(TRANSACTION_STATUS.PENDING).toBe('pending');
      expect(TRANSACTION_STATUS.CONFIRMED).toBe('confirmed');
      expect(TRANSACTION_STATUS.FAILED).toBe('failed');
      expect(TRANSACTION_STATUS.FINALIZED).toBe('finalized');
    });
  });

  describe('TRANSACTION_TYPE', () => {
    it('should have all types defined', () => {
      expect(TRANSACTION_TYPE.TRANSFER).toBe('transfer');
      expect(TRANSACTION_TYPE.CONTRACT_DEPLOY).toBe('contract_deploy');
      expect(TRANSACTION_TYPE.CONTRACT_CALL).toBe('contract_call');
      expect(TRANSACTION_TYPE.STAKE).toBe('stake');
      expect(TRANSACTION_TYPE.UNSTAKE).toBe('unstake');
    });
  });

  describe('PROOF_STATUS', () => {
    it('should have all statuses defined', () => {
      expect(PROOF_STATUS.PENDING).toBe('pending');
      expect(PROOF_STATUS.VERIFIED).toBe('verified');
      expect(PROOF_STATUS.FAILED).toBe('failed');
    });
  });

  describe('Timeouts', () => {
    it('should have reasonable timeout values', () => {
      expect(REQUEST_TIMEOUT).toBe(30000);
      expect(WS_TIMEOUT).toBe(30000);
    });
  });

  describe('POLLING_INTERVALS', () => {
    it('should have correct interval values', () => {
      expect(POLLING_INTERVALS.MIN).toBe(1000);
      expect(POLLING_INTERVALS.DEFAULT).toBe(5000);
      expect(POLLING_INTERVALS.MAX).toBe(60000);
    });

    it('should have MIN <= DEFAULT <= MAX', () => {
      expect(POLLING_INTERVALS.MIN).toBeLessThanOrEqual(POLLING_INTERVALS.DEFAULT);
      expect(POLLING_INTERVALS.DEFAULT).toBeLessThanOrEqual(POLLING_INTERVALS.MAX);
    });
  });

  describe('RPC_ERROR_CODES', () => {
    it('should have standard JSON-RPC error codes', () => {
      expect(RPC_ERROR_CODES.PARSE_ERROR).toBe(-32700);
      expect(RPC_ERROR_CODES.INVALID_REQUEST).toBe(-32600);
      expect(RPC_ERROR_CODES.METHOD_NOT_FOUND).toBe(-32601);
      expect(RPC_ERROR_CODES.INVALID_PARAMS).toBe(-32602);
      expect(RPC_ERROR_CODES.INTERNAL_ERROR).toBe(-32603);
    });
  });
});
