/*
 * Copyright (c) Velocity BPA, LLC
 * Licensed under the Business Source License 1.1
 * Commercial use requires a separate commercial license.
 * See LICENSE file for details.
 */

import type { IExecuteFunctions, ICredentialDataDecryptedObject } from 'n8n-workflow';
import { NodeApiError } from 'n8n-workflow';
import WebSocket from 'ws';
import { getRpcUrl } from './graphql';

interface RpcResponse {
  jsonrpc: string;
  id: number;
  result?: unknown;
  error?: {
    code: number;
    message: string;
    data?: unknown;
  };
}

interface RpcRequest {
  jsonrpc: '2.0';
  id: number;
  method: string;
  params: unknown[];
}

/**
 * Execute a JSON-RPC request against the Midnight node
 */
export async function midnightRpcRequest(
  this: IExecuteFunctions,
  method: string,
  params: unknown[] = [],
): Promise<unknown> {
  const credentials = await this.getCredentials('midnightApi');
  const rpcUrl = getRpcUrl(credentials);

  // Convert WebSocket URL to HTTP for simple RPC calls
  const httpUrl = rpcUrl.replace('wss://', 'https://').replace('ws://', 'http://');

  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
  };

  const apiKey = credentials.apiKey as string;
  if (apiKey) {
    headers['Authorization'] = `Bearer ${apiKey}`;
  }

  const requestBody: RpcRequest = {
    jsonrpc: '2.0',
    id: 1,
    method,
    params,
  };

  const requestOptions = {
    method: 'POST' as const,
    uri: httpUrl,
    headers,
    body: requestBody,
    json: true,
  };

  try {
    const response: RpcResponse = await this.helpers.request(requestOptions);

    if (response.error) {
      throw new NodeApiError(this.getNode(), { code: response.error.code, message: response.error.message }, {
        message: `RPC Error (${response.error.code}): ${response.error.message}`,
      });
    }

    return response.result;
  } catch (error: unknown) {
    if (error instanceof NodeApiError) {
      throw error;
    }
    const err = error as Error;
    throw new NodeApiError(this.getNode(), { message: err.message }, {
      message: `Failed to execute RPC request: ${err.message}`,
    });
  }
}

/**
 * RPC method definitions for chain operations
 */
export const rpcMethods = {
  chain: {
    getHeader: 'chain_getHeader',
    getBlockHash: 'chain_getBlockHash',
    getFinalizedHead: 'chain_getFinalizedHead',
    subscribeNewHeads: 'chain_subscribeNewHeads',
    subscribeFinalizedHeads: 'chain_subscribeFinalizedHeads',
    unsubscribeNewHeads: 'chain_unsubscribeNewHeads',
    unsubscribeFinalizedHeads: 'chain_unsubscribeFinalizedHeads',
  },
  system: {
    health: 'system_health',
    peers: 'system_peers',
    version: 'system_version',
    syncState: 'system_syncState',
    name: 'system_name',
    chain: 'system_chain',
  },
  midnight: {
    apiVersions: 'midnight_apiVersions',
  },
};

/**
 * WebSocket subscription handler for real-time events
 */
export class MidnightRpcSubscription {
  private ws: WebSocket | null = null;
  private subscriptionId: string | null = null;
  private rpcUrl: string;
  private messageId = 0;

  constructor(credentials: ICredentialDataDecryptedObject) {
    this.rpcUrl = getRpcUrl(credentials);
  }

  /**
   * Subscribe to a JSON-RPC method
   */
  async subscribe(
    method: string,
    params: unknown[],
    callback: (data: unknown) => void,
  ): Promise<string> {
    return new Promise((resolve, reject) => {
      this.ws = new WebSocket(this.rpcUrl);

      this.ws.on('open', () => {
        const request: RpcRequest = {
          jsonrpc: '2.0',
          id: ++this.messageId,
          method,
          params,
        };
        this.ws!.send(JSON.stringify(request));
      });

      this.ws.on('message', (data: WebSocket.Data) => {
        try {
          const message = JSON.parse(data.toString()) as RpcResponse & {
            params?: { subscription: string; result: unknown };
            method?: string;
          };

          // Handle subscription confirmation
          if (message.id === this.messageId && message.result) {
            this.subscriptionId = message.result as string;
            resolve(this.subscriptionId);
          }

          // Handle subscription data
          if (
            message.params &&
            message.params.subscription === this.subscriptionId
          ) {
            callback(message.params.result);
          }

          // Handle errors
          if (message.error) {
            reject(new Error(`RPC Error: ${message.error.message}`));
          }
        } catch (err) {
          // Ignore parse errors for non-JSON messages
        }
      });

      this.ws.on('error', (error: Error) => {
        reject(error);
      });

      this.ws.on('close', () => {
        this.subscriptionId = null;
      });

      // Timeout after 30 seconds
      setTimeout(() => {
        if (!this.subscriptionId) {
          reject(new Error('Subscription timeout'));
        }
      }, 30000);
    });
  }

  /**
   * Unsubscribe from a JSON-RPC method
   */
  async unsubscribe(unsubMethod: string): Promise<void> {
    if (this.ws && this.subscriptionId) {
      const request: RpcRequest = {
        jsonrpc: '2.0',
        id: ++this.messageId,
        method: unsubMethod,
        params: [this.subscriptionId],
      };
      this.ws.send(JSON.stringify(request));
      this.ws.close();
      this.subscriptionId = null;
    }
  }

  /**
   * Close the WebSocket connection
   */
  close(): void {
    if (this.ws) {
      this.ws.close();
      this.ws = null;
      this.subscriptionId = null;
    }
  }

  /**
   * Check if the subscription is active
   */
  isActive(): boolean {
    return this.ws !== null && this.subscriptionId !== null;
  }
}

/**
 * GraphQL subscription handler for real-time events via WebSocket
 */
export class MidnightGraphQLSubscription {
  private ws: WebSocket | null = null;
  private subscriptionId: string | null = null;
  private indexerUrl: string;
  private messageId = 0;

  constructor(credentials: ICredentialDataDecryptedObject) {
    // Convert HTTP URL to WebSocket URL
    const httpUrl =
      credentials.network === 'custom'
        ? (credentials.customIndexerUrl as string)
        : credentials.network === 'mainnet'
          ? ((credentials.mainnetIndexerUrl as string) ||
            'https://indexer.midnight.network/api/v3/graphql')
          : ((credentials.indexerUrl as string) ||
            'https://indexer.testnet-02.midnight.network/api/v3/graphql');

    this.indexerUrl = httpUrl
      .replace('https://', 'wss://')
      .replace('http://', 'ws://');
  }

  /**
   * Subscribe to a GraphQL subscription
   */
  async subscribe(
    subscription: string,
    variables: Record<string, unknown>,
    callback: (data: unknown) => void,
  ): Promise<string> {
    return new Promise((resolve, reject) => {
      this.ws = new WebSocket(this.indexerUrl, 'graphql-ws');

      this.ws.on('open', () => {
        // Initialize connection
        this.ws!.send(JSON.stringify({ type: 'connection_init' }));
      });

      this.ws.on('message', (data: WebSocket.Data) => {
        try {
          const message = JSON.parse(data.toString()) as {
            type: string;
            id?: string;
            payload?: { data?: unknown; errors?: unknown[] };
          };

          switch (message.type) {
            case 'connection_ack':
              // Connection acknowledged, start subscription
              this.subscriptionId = `sub_${++this.messageId}`;
              this.ws!.send(
                JSON.stringify({
                  type: 'start',
                  id: this.subscriptionId,
                  payload: {
                    query: subscription,
                    variables,
                  },
                }),
              );
              resolve(this.subscriptionId);
              break;

            case 'data':
              if (message.id === this.subscriptionId && message.payload?.data) {
                callback(message.payload.data);
              }
              break;

            case 'error':
              reject(
                new Error(
                  `GraphQL Subscription Error: ${JSON.stringify(message.payload)}`,
                ),
              );
              break;

            case 'complete':
              this.close();
              break;
          }
        } catch (err) {
          // Ignore parse errors
        }
      });

      this.ws.on('error', (error: Error) => {
        reject(error);
      });

      this.ws.on('close', () => {
        this.subscriptionId = null;
      });

      // Timeout after 30 seconds
      setTimeout(() => {
        if (!this.subscriptionId) {
          reject(new Error('Subscription timeout'));
        }
      }, 30000);
    });
  }

  /**
   * Stop the subscription
   */
  stop(): void {
    if (this.ws && this.subscriptionId) {
      this.ws.send(
        JSON.stringify({
          type: 'stop',
          id: this.subscriptionId,
        }),
      );
    }
  }

  /**
   * Close the WebSocket connection
   */
  close(): void {
    if (this.ws) {
      this.stop();
      this.ws.close();
      this.ws = null;
      this.subscriptionId = null;
    }
  }

  /**
   * Check if the subscription is active
   */
  isActive(): boolean {
    return this.ws !== null && this.subscriptionId !== null;
  }
}
