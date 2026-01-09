/*
 * Copyright (c) Velocity BPA, LLC
 * Licensed under the Business Source License 1.1
 * Commercial use requires a separate commercial license.
 * See LICENSE file for details.
 */

import type { IDataObject } from 'n8n-workflow';
import { PAGINATION } from '../constants';

/**
 * Validate and parse a block hash
 */
export function validateBlockHash(hash: string): string {
  const cleanHash = hash.startsWith('0x') ? hash : `0x${hash}`;
  if (!/^0x[a-fA-F0-9]{64}$/.test(cleanHash)) {
    throw new Error(`Invalid block hash format: ${hash}. Expected 64 hex characters.`);
  }
  return cleanHash;
}

/**
 * Validate and parse a transaction hash
 */
export function validateTransactionHash(hash: string): string {
  const cleanHash = hash.startsWith('0x') ? hash : `0x${hash}`;
  if (!/^0x[a-fA-F0-9]{64}$/.test(cleanHash)) {
    throw new Error(`Invalid transaction hash format: ${hash}. Expected 64 hex characters.`);
  }
  return cleanHash;
}

/**
 * Validate and parse a contract address
 */
export function validateContractAddress(address: string): string {
  const cleanAddress = address.startsWith('0x') ? address : `0x${address}`;
  if (!/^0x[a-fA-F0-9]{40,64}$/.test(cleanAddress)) {
    throw new Error(`Invalid contract address format: ${address}.`);
  }
  return cleanAddress;
}

/**
 * Validate a stake key (Cardano format)
 */
export function validateStakeKey(stakeKey: string): string {
  // Stake keys typically start with 'stake' or are hex
  if (!stakeKey || stakeKey.length < 10) {
    throw new Error(`Invalid stake key format: ${stakeKey}.`);
  }
  return stakeKey;
}

/**
 * Validate a proof ID
 */
export function validateProofId(proofId: string): string {
  if (!proofId || proofId.length === 0) {
    throw new Error('Proof ID cannot be empty.');
  }
  return proofId;
}

/**
 * Parse pagination parameters
 */
export function parsePaginationParams(
  limit?: number,
  offset?: number,
): { limit: number; offset: number } {
  const parsedLimit = Math.min(
    Math.max(1, limit ?? PAGINATION.DEFAULT_LIMIT),
    PAGINATION.MAX_LIMIT,
  );
  const parsedOffset = Math.max(0, offset ?? PAGINATION.DEFAULT_OFFSET);

  return {
    limit: parsedLimit,
    offset: parsedOffset,
  };
}

/**
 * Format timestamp to ISO string
 */
export function formatTimestamp(timestamp: number | string): string {
  if (typeof timestamp === 'string') {
    return timestamp;
  }
  return new Date(timestamp).toISOString();
}

/**
 * Parse block height from string or number
 */
export function parseBlockHeight(height: string | number): number {
  const parsed = typeof height === 'string' ? parseInt(height, 10) : height;
  if (isNaN(parsed) || parsed < 0) {
    throw new Error(`Invalid block height: ${height}. Must be a non-negative integer.`);
  }
  return parsed;
}

/**
 * Sanitize and prepare GraphQL variables
 */
export function prepareGraphQLVariables(
  variables: Record<string, unknown>,
): Record<string, unknown> {
  const result: Record<string, unknown> = {};

  for (const [key, value] of Object.entries(variables)) {
    if (value !== undefined && value !== null && value !== '') {
      result[key] = value;
    }
  }

  return result;
}

/**
 * Extract data from nested GraphQL response
 */
export function extractGraphQLData(
  response: unknown,
  path: string[],
): unknown {
  let current = response as Record<string, unknown>;

  for (const key of path) {
    if (current && typeof current === 'object' && key in current) {
      current = current[key] as Record<string, unknown>;
    } else {
      return null;
    }
  }

  return current;
}

/**
 * Transform response to n8n output format
 */
export function transformToOutput(data: unknown): IDataObject | IDataObject[] {
  if (Array.isArray(data)) {
    return data.map((item) => transformSingleItem(item));
  }
  return transformSingleItem(data);
}

/**
 * Transform a single item to n8n format
 */
function transformSingleItem(item: unknown): IDataObject {
  if (item === null || item === undefined) {
    return {};
  }

  if (typeof item !== 'object') {
    return { value: item };
  }

  const result: IDataObject = {};
  for (const [key, value] of Object.entries(item as Record<string, unknown>)) {
    if (value !== null && value !== undefined) {
      if (typeof value === 'object' && !Array.isArray(value)) {
        result[key] = transformSingleItem(value);
      } else {
        result[key] = value as IDataObject[keyof IDataObject];
      }
    }
  }

  return result;
}

/**
 * Create a simple return data wrapper
 */
export function wrapInArray<T>(data: T): T[] {
  return Array.isArray(data) ? data : [data];
}

/**
 * Sleep utility for polling
 */
export function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

/**
 * Log the licensing notice (called once per node load)
 */
let licenseNoticeLogged = false;

export function logLicenseNotice(logger: { warn: (message: string) => void }): void {
  if (!licenseNoticeLogged) {
    logger.warn(`[Velocity BPA Licensing Notice]

This n8n node is licensed under the Business Source License 1.1 (BSL 1.1).

Use of this node by for-profit organizations in production environments requires a commercial license from Velocity BPA.

For licensing information, visit https://velobpa.com/licensing or contact licensing@velobpa.com.`);
    licenseNoticeLogged = true;
  }
}
