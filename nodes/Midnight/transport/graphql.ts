/*
 * Copyright (c) Velocity BPA, LLC
 * Licensed under the Business Source License 1.1
 * Commercial use requires a separate commercial license.
 * See LICENSE file for details.
 */

import type { IExecuteFunctions, ILoadOptionsFunctions, ICredentialDataDecryptedObject } from 'n8n-workflow';
import { NodeApiError } from 'n8n-workflow';

/**
 * Get the indexer URL based on credentials configuration
 */
export function getIndexerUrl(credentials: ICredentialDataDecryptedObject): string {
  const network = credentials.network as string;

  switch (network) {
    case 'custom':
      return credentials.customIndexerUrl as string;
    case 'mainnet':
      return (
        (credentials.mainnetIndexerUrl as string) ||
        'https://indexer.midnight.network/api/v3/graphql'
      );
    case 'testnet':
    default:
      return (
        (credentials.indexerUrl as string) ||
        'https://indexer.testnet-02.midnight.network/api/v3/graphql'
      );
  }
}

/**
 * Get the RPC URL based on credentials configuration
 */
export function getRpcUrl(credentials: ICredentialDataDecryptedObject): string {
  const network = credentials.network as string;

  switch (network) {
    case 'custom':
      return credentials.customRpcUrl as string;
    case 'mainnet':
      return (credentials.mainnetRpcUrl as string) || 'wss://rpc.midnight.network';
    case 'testnet':
    default:
      return (credentials.rpcUrl as string) || 'wss://rpc.testnet-02.midnight.network';
  }
}

/**
 * Execute a GraphQL query against the Midnight indexer
 */
export async function midnightGraphQLRequest(
  this: IExecuteFunctions | ILoadOptionsFunctions,
  query: string,
  variables: Record<string, unknown> = {},
): Promise<unknown> {
  const credentials = await this.getCredentials('midnightApi');
  const indexerUrl = getIndexerUrl(credentials);

  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
  };

  const apiKey = credentials.apiKey as string;
  if (apiKey) {
    headers['Authorization'] = `Bearer ${apiKey}`;
  }

  const requestOptions = {
    method: 'POST' as const,
    uri: indexerUrl,
    headers,
    body: {
      query,
      variables,
    },
    json: true,
  };

  try {
    const response = await this.helpers.request(requestOptions);

    if (response.errors && response.errors.length > 0) {
      const errorMessages = response.errors
        .map((e: { message: string }) => e.message)
        .join(', ');
      throw new NodeApiError(this.getNode(), response, {
        message: `GraphQL Error: ${errorMessages}`,
      });
    }

    return response.data;
  } catch (error: unknown) {
    if (error instanceof NodeApiError) {
      throw error;
    }
    const err = error as Error;
    throw new NodeApiError(this.getNode(), { message: err.message }, {
      message: `Failed to execute GraphQL request: ${err.message}`,
    });
  }
}

/**
 * GraphQL query definitions for blocks
 */
export const blockQueries = {
  getByHash: `
    query GetBlock($hash: String!) {
      block(hash: $hash) {
        hash
        height
        timestamp
        author
        parentHash
        stateRoot
        extrinsicsRoot
        transactions {
          hash
          status
        }
      }
    }
  `,

  getByHeight: `
    query GetBlockByHeight($height: Int!) {
      blockByHeight(height: $height) {
        hash
        height
        timestamp
        author
        parentHash
        transactions {
          hash
        }
      }
    }
  `,

  list: `
    query ListBlocks($limit: Int, $offset: Int) {
      blocks(limit: $limit, offset: $offset) {
        hash
        height
        timestamp
        author
        transactionCount
      }
    }
  `,

  getLatest: `
    query GetLatestBlock {
      latestBlock {
        hash
        height
        timestamp
        author
      }
    }
  `,

  getFinalized: `
    query GetFinalizedBlock {
      finalizedBlock {
        hash
        height
        timestamp
      }
    }
  `,
};

/**
 * GraphQL query definitions for transactions
 */
export const transactionQueries = {
  get: `
    query GetTransaction($hash: String!) {
      transaction(hash: $hash) {
        hash
        blockHash
        blockHeight
        timestamp
        status
        type
        fee
        contractAddress
        inputCount
        outputCount
      }
    }
  `,

  listByBlock: `
    query GetBlockTransactions($blockHash: String!, $limit: Int) {
      blockTransactions(blockHash: $blockHash, limit: $limit) {
        hash
        status
        type
        fee
        timestamp
      }
    }
  `,

  list: `
    query ListTransactions($limit: Int, $offset: Int) {
      transactions(limit: $limit, offset: $offset) {
        hash
        blockHash
        status
        type
        timestamp
      }
    }
  `,

  getStatus: `
    query GetTransactionStatus($hash: String!) {
      transactionStatus(hash: $hash) {
        status
        confirmations
        blockHash
        error
      }
    }
  `,
};

/**
 * GraphQL query definitions for contracts
 */
export const contractQueries = {
  get: `
    query GetContract($address: String!) {
      contract(address: $address) {
        address
        deploymentBlockHash
        deploymentTimestamp
        bytecodeHash
        state
      }
    }
  `,

  list: `
    query ListContracts($limit: Int, $offset: Int) {
      contracts(limit: $limit, offset: $offset) {
        address
        deploymentTimestamp
        transactionCount
      }
    }
  `,

  getActions: `
    query GetContractActions($address: String!, $limit: Int) {
      contractActions(address: $address, limit: $limit) {
        transactionHash
        actionType
        timestamp
        blockHeight
      }
    }
  `,

  getState: `
    query GetContractState($address: String!, $key: String) {
      contractState(address: $address, key: $key) {
        key
        value
        lastUpdated
      }
    }
  `,
};

/**
 * GraphQL query definitions for chain
 */
export const chainQueries = {
  getInfo: `
    query GetChainInfo {
      chainInfo {
        chainName
        genesisHash
        latestHeight
        finalizedHeight
        networkVersion
      }
    }
  `,

  getProperties: `
    query GetChainProperties {
      chainProperties {
        tokenSymbol
        tokenDecimals
        ss58Format
      }
    }
  `,
};

/**
 * GraphQL query definitions for DUST
 */
export const dustQueries = {
  getGenerationStatus: `
    query GetDustGenerationStatus($stakeKey: String!) {
      dustGenerationStatus(stakeKey: $stakeKey) {
        registered
        generationRate
        totalGenerated
        lastGenerationTimestamp
      }
    }
  `,

  getRegistrationStatus: `
    query GetRegistrationStatus($stakeKey: String!) {
      registrationStatus(stakeKey: $stakeKey) {
        registered
        registrationTimestamp
        registrationTxHash
      }
    }
  `,
};

/**
 * GraphQL query definitions for proofs
 */
export const proofQueries = {
  getStatus: `
    query GetProofStatus($proofId: String!) {
      proofStatus(proofId: $proofId) {
        id
        status
        verificationResult
        submissionTimestamp
        verificationTimestamp
      }
    }
  `,

  listByContract: `
    query ListContractProofs($contractAddress: String!, $limit: Int) {
      contractProofs(contractAddress: $contractAddress, limit: $limit) {
        proofId
        transactionHash
        status
        timestamp
      }
    }
  `,
};

/**
 * GraphQL subscription definitions
 */
export const subscriptions = {
  newBlock: `
    subscription OnNewBlock {
      blocks {
        hash
        height
        timestamp
        author
        transactions {
          hash
        }
      }
    }
  `,

  newBlockFromHeight: `
    subscription OnBlockFromHeight($height: Int!) {
      blocks(offset: { height: $height }) {
        hash
        height
        timestamp
        transactions {
          hash
        }
      }
    }
  `,

  finalizedBlock: `
    subscription OnFinalizedBlock {
      finalizedBlocks {
        hash
        height
        timestamp
      }
    }
  `,

  contractAction: `
    subscription OnContractAction($address: String!) {
      contractAction(address: $address) {
        transactionHash
        actionType
        blockHeight
        timestamp
      }
    }
  `,
};
