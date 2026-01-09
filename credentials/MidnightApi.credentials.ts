/*
 * Copyright (c) Velocity BPA, LLC
 * Licensed under the Business Source License 1.1
 * Commercial use requires a separate commercial license.
 * See LICENSE file for details.
 */

import type {
  IAuthenticateGeneric,
  ICredentialTestRequest,
  ICredentialType,
  INodeProperties,
} from 'n8n-workflow';

export class MidnightApi implements ICredentialType {
  name = 'midnightApi';
  displayName = 'Midnight API';
  documentationUrl = 'https://docs.midnight.network/';
  properties: INodeProperties[] = [
    {
      displayName: 'Network',
      name: 'network',
      type: 'options',
      options: [
        {
          name: 'Testnet',
          value: 'testnet',
        },
        {
          name: 'Mainnet',
          value: 'mainnet',
        },
        {
          name: 'Custom',
          value: 'custom',
        },
      ],
      default: 'testnet',
      description: 'The Midnight network to connect to',
    },
    {
      displayName: 'Indexer GraphQL URL',
      name: 'indexerUrl',
      type: 'string',
      default: 'https://indexer.testnet-02.midnight.network/api/v3/graphql',
      displayOptions: {
        show: {
          network: ['testnet'],
        },
      },
      description: 'The GraphQL endpoint for the Midnight indexer',
    },
    {
      displayName: 'Mainnet Indexer URL',
      name: 'mainnetIndexerUrl',
      type: 'string',
      default: 'https://indexer.midnight.network/api/v3/graphql',
      displayOptions: {
        show: {
          network: ['mainnet'],
        },
      },
      description: 'The GraphQL endpoint for the Midnight mainnet indexer',
    },
    {
      displayName: 'Custom Indexer URL',
      name: 'customIndexerUrl',
      type: 'string',
      default: '',
      displayOptions: {
        show: {
          network: ['custom'],
        },
      },
      placeholder: 'https://your-indexer.example.com/api/v3/graphql',
      description: 'Custom GraphQL endpoint URL for private or enterprise deployments',
    },
    {
      displayName: 'RPC WebSocket URL',
      name: 'rpcUrl',
      type: 'string',
      default: 'wss://rpc.testnet-02.midnight.network',
      displayOptions: {
        show: {
          network: ['testnet'],
        },
      },
      description: 'The WebSocket RPC endpoint for the Midnight node',
    },
    {
      displayName: 'Mainnet RPC URL',
      name: 'mainnetRpcUrl',
      type: 'string',
      default: 'wss://rpc.midnight.network',
      displayOptions: {
        show: {
          network: ['mainnet'],
        },
      },
      description: 'The WebSocket RPC endpoint for the Midnight mainnet node',
    },
    {
      displayName: 'Custom RPC URL',
      name: 'customRpcUrl',
      type: 'string',
      default: '',
      displayOptions: {
        show: {
          network: ['custom'],
        },
      },
      placeholder: 'wss://your-rpc.example.com',
      description: 'Custom RPC endpoint URL for private or enterprise deployments',
    },
    {
      displayName: 'API Key (Optional)',
      name: 'apiKey',
      type: 'string',
      typeOptions: {
        password: true,
      },
      default: '',
      description:
        'API key for private or enterprise deployments. Leave empty for public access.',
    },
  ];

  authenticate: IAuthenticateGeneric = {
    type: 'generic',
    properties: {
      headers: {
        Authorization: '={{"Bearer " + $credentials.apiKey}}',
      },
    },
  };

  test: ICredentialTestRequest = {
    request: {
      baseURL: '={{$credentials.network === "custom" ? $credentials.customIndexerUrl : ($credentials.network === "mainnet" ? $credentials.mainnetIndexerUrl : $credentials.indexerUrl)}}',
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        query: '{ chainInfo { chainName } }',
      }),
    },
  };
}
