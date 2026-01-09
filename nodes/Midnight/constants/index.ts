/*
 * Copyright (c) Velocity BPA, LLC
 * Licensed under the Business Source License 1.1
 * Commercial use requires a separate commercial license.
 * See LICENSE file for details.
 */

/**
 * Default pagination settings
 */
export const PAGINATION = {
  DEFAULT_LIMIT: 25,
  MAX_LIMIT: 100,
  DEFAULT_OFFSET: 0,
} as const;

/**
 * Network configuration
 */
export const NETWORKS = {
  testnet: {
    name: 'Testnet',
    indexerUrl: 'https://indexer.testnet-02.midnight.network/api/v3/graphql',
    rpcUrl: 'wss://rpc.testnet-02.midnight.network',
  },
  mainnet: {
    name: 'Mainnet',
    indexerUrl: 'https://indexer.midnight.network/api/v3/graphql',
    rpcUrl: 'wss://rpc.midnight.network',
  },
} as const;

/**
 * Transaction statuses
 */
export const TRANSACTION_STATUS = {
  PENDING: 'pending',
  CONFIRMED: 'confirmed',
  FAILED: 'failed',
  FINALIZED: 'finalized',
} as const;

/**
 * Transaction types
 */
export const TRANSACTION_TYPE = {
  TRANSFER: 'transfer',
  CONTRACT_DEPLOY: 'contract_deploy',
  CONTRACT_CALL: 'contract_call',
  STAKE: 'stake',
  UNSTAKE: 'unstake',
} as const;

/**
 * Proof verification statuses
 */
export const PROOF_STATUS = {
  PENDING: 'pending',
  VERIFIED: 'verified',
  FAILED: 'failed',
} as const;

/**
 * API request timeout in milliseconds
 */
export const REQUEST_TIMEOUT = 30000;

/**
 * WebSocket connection timeout in milliseconds
 */
export const WS_TIMEOUT = 30000;

/**
 * Polling intervals in milliseconds
 */
export const POLLING_INTERVALS = {
  MIN: 1000,
  DEFAULT: 5000,
  MAX: 60000,
} as const;

/**
 * Error codes mapping
 */
export const RPC_ERROR_CODES = {
  PARSE_ERROR: -32700,
  INVALID_REQUEST: -32600,
  METHOD_NOT_FOUND: -32601,
  INVALID_PARAMS: -32602,
  INTERNAL_ERROR: -32603,
} as const;
