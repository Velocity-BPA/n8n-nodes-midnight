/*
 * Copyright (c) Velocity BPA, LLC
 * Licensed under the Business Source License 1.1
 * Commercial use requires a separate commercial license.
 * See LICENSE file for details.
 */

import type {
  IExecuteFunctions,
  INodeExecutionData,
  INodeType,
  INodeTypeDescription,
} from 'n8n-workflow';

import * as block from './actions/block';
import * as transaction from './actions/transaction';
import * as contract from './actions/contract';
import * as chain from './actions/chain';
import * as network from './actions/network';
import * as dust from './actions/dust';
import * as proof from './actions/proof';
import { logLicenseNotice } from './utils';

export class Midnight implements INodeType {
  description: INodeTypeDescription = {
    displayName: 'Midnight',
    name: 'midnight',
    icon: 'file:midnight.svg',
    group: ['transform'],
    version: 1,
    subtitle: '={{$parameter["operation"] + ": " + $parameter["resource"]}}',
    description:
      'Interact with the Midnight blockchain - a privacy-first network using zero-knowledge cryptography',
    defaults: {
      name: 'Midnight',
    },
    inputs: ['main'],
    outputs: ['main'],
    credentials: [
      {
        name: 'midnightApi',
        required: true,
      },
    ],
    properties: [
      {
        displayName: 'Resource',
        name: 'resource',
        type: 'options',
        noDataExpression: true,
        options: [
          {
            name: 'Block',
            value: 'block',
            description: 'Query blockchain blocks and headers',
          },
          {
            name: 'Chain',
            value: 'chain',
            description: 'Query chain state and network information',
          },
          {
            name: 'Contract',
            value: 'contract',
            description: 'Query smart contract state and actions',
          },
          {
            name: 'DUST',
            value: 'dust',
            description: 'Query DUST token generation and registration status',
          },
          {
            name: 'Network',
            value: 'network',
            description: 'Network and node information',
          },
          {
            name: 'Proof',
            value: 'proof',
            description: 'Query zero-knowledge proof operations',
          },
          {
            name: 'Transaction',
            value: 'transaction',
            description: 'Query and monitor transactions',
          },
        ],
        default: 'block',
      },
      // Block operations
      {
        displayName: 'Operation',
        name: 'operation',
        type: 'options',
        noDataExpression: true,
        displayOptions: {
          show: {
            resource: ['block'],
          },
        },
        options: [
          {
            name: 'Get by Hash',
            value: 'getByHash',
            description: 'Get a block by its hash',
            action: 'Get block by hash',
          },
          {
            name: 'Get by Height',
            value: 'getByHeight',
            description: 'Get a block by its height',
            action: 'Get block by height',
          },
          {
            name: 'Get Finalized',
            value: 'getFinalized',
            description: 'Get the latest finalized block',
            action: 'Get finalized block',
          },
          {
            name: 'Get Latest',
            value: 'getLatest',
            description: 'Get the latest block',
            action: 'Get latest block',
          },
          {
            name: 'List',
            value: 'list',
            description: 'List recent blocks',
            action: 'List blocks',
          },
        ],
        default: 'getLatest',
      },
      // Transaction operations
      {
        displayName: 'Operation',
        name: 'operation',
        type: 'options',
        noDataExpression: true,
        displayOptions: {
          show: {
            resource: ['transaction'],
          },
        },
        options: [
          {
            name: 'Get',
            value: 'get',
            description: 'Get a transaction by hash',
            action: 'Get transaction',
          },
          {
            name: 'Get Status',
            value: 'getStatus',
            description: 'Get transaction status and confirmations',
            action: 'Get transaction status',
          },
          {
            name: 'List',
            value: 'list',
            description: 'List recent transactions',
            action: 'List transactions',
          },
          {
            name: 'List by Block',
            value: 'listByBlock',
            description: 'List transactions in a specific block',
            action: 'List transactions by block',
          },
        ],
        default: 'get',
      },
      // Contract operations
      {
        displayName: 'Operation',
        name: 'operation',
        type: 'options',
        noDataExpression: true,
        displayOptions: {
          show: {
            resource: ['contract'],
          },
        },
        options: [
          {
            name: 'Get',
            value: 'get',
            description: 'Get contract details',
            action: 'Get contract',
          },
          {
            name: 'Get Actions',
            value: 'getActions',
            description: 'Get contract action history',
            action: 'Get contract actions',
          },
          {
            name: 'Get State',
            value: 'getState',
            description: 'Get contract state',
            action: 'Get contract state',
          },
          {
            name: 'List',
            value: 'list',
            description: 'List deployed contracts',
            action: 'List contracts',
          },
        ],
        default: 'get',
      },
      // Chain operations
      {
        displayName: 'Operation',
        name: 'operation',
        type: 'options',
        noDataExpression: true,
        displayOptions: {
          show: {
            resource: ['chain'],
          },
        },
        options: [
          {
            name: 'Get Info',
            value: 'getInfo',
            description: 'Get chain information',
            action: 'Get chain info',
          },
          {
            name: 'Get Properties',
            value: 'getProperties',
            description: 'Get chain properties (token symbol, decimals)',
            action: 'Get chain properties',
          },
          {
            name: 'Get State',
            value: 'getState',
            description: 'Get current chain state/header via RPC',
            action: 'Get chain state',
          },
        ],
        default: 'getInfo',
      },
      // Network operations
      {
        displayName: 'Operation',
        name: 'operation',
        type: 'options',
        noDataExpression: true,
        displayOptions: {
          show: {
            resource: ['network'],
          },
        },
        options: [
          {
            name: 'Get Peers',
            value: 'getPeers',
            description: 'Get connected peer information',
            action: 'Get connected peers',
          },
          {
            name: 'Get Status',
            value: 'getStatus',
            description: 'Get node health status',
            action: 'Get network status',
          },
          {
            name: 'Get Sync State',
            value: 'getSyncState',
            description: 'Get sync progress',
            action: 'Get sync state',
          },
          {
            name: 'Get Version',
            value: 'getVersion',
            description: 'Get node software version',
            action: 'Get node version',
          },
        ],
        default: 'getStatus',
      },
      // DUST operations
      {
        displayName: 'Operation',
        name: 'operation',
        type: 'options',
        noDataExpression: true,
        displayOptions: {
          show: {
            resource: ['dust'],
          },
        },
        options: [
          {
            name: 'Get Generation Status',
            value: 'getGenerationStatus',
            description: 'Get DUST token generation status for a stake key',
            action: 'Get DUST generation status',
          },
          {
            name: 'Get Registration Status',
            value: 'getRegistrationStatus',
            description: 'Get registration status for a stake key',
            action: 'Get registration status',
          },
        ],
        default: 'getGenerationStatus',
      },
      // Proof operations
      {
        displayName: 'Operation',
        name: 'operation',
        type: 'options',
        noDataExpression: true,
        displayOptions: {
          show: {
            resource: ['proof'],
          },
        },
        options: [
          {
            name: 'Get Status',
            value: 'getStatus',
            description: 'Get zero-knowledge proof status',
            action: 'Get proof status',
          },
          {
            name: 'List by Contract',
            value: 'listByContract',
            description: 'List proofs for a specific contract',
            action: 'List contract proofs',
          },
        ],
        default: 'getStatus',
      },
      // Operation-specific parameters
      ...block.getByHash.description,
      ...block.getByHeight.description,
      ...block.list.description,
      ...transaction.get.description,
      ...transaction.listByBlock.description,
      ...transaction.list.description,
      ...transaction.getStatus.description,
      ...contract.get.description,
      ...contract.list.description,
      ...contract.getActions.description,
      ...contract.getState.description,
      ...chain.getState.description,
      ...dust.getGenerationStatus.description,
      ...dust.getRegistrationStatus.description,
      ...proof.getStatus.description,
      ...proof.listByContract.description,
    ],
  };

  async execute(this: IExecuteFunctions): Promise<INodeExecutionData[][]> {
    // Log licensing notice once per node load
    logLicenseNotice(this.logger);

    const items = this.getInputData();
    const returnData: INodeExecutionData[] = [];

    const resource = this.getNodeParameter('resource', 0) as string;
    const operation = this.getNodeParameter('operation', 0) as string;

    for (let i = 0; i < items.length; i++) {
      try {
        let result: INodeExecutionData[] = [];

        switch (resource) {
          case 'block':
            switch (operation) {
              case 'getByHash':
                result = await block.getByHash.execute.call(this, i);
                break;
              case 'getByHeight':
                result = await block.getByHeight.execute.call(this, i);
                break;
              case 'list':
                result = await block.list.execute.call(this, i);
                break;
              case 'getLatest':
                result = await block.getLatest.execute.call(this, i);
                break;
              case 'getFinalized':
                result = await block.getFinalized.execute.call(this, i);
                break;
            }
            break;

          case 'transaction':
            switch (operation) {
              case 'get':
                result = await transaction.get.execute.call(this, i);
                break;
              case 'listByBlock':
                result = await transaction.listByBlock.execute.call(this, i);
                break;
              case 'list':
                result = await transaction.list.execute.call(this, i);
                break;
              case 'getStatus':
                result = await transaction.getStatus.execute.call(this, i);
                break;
            }
            break;

          case 'contract':
            switch (operation) {
              case 'get':
                result = await contract.get.execute.call(this, i);
                break;
              case 'list':
                result = await contract.list.execute.call(this, i);
                break;
              case 'getActions':
                result = await contract.getActions.execute.call(this, i);
                break;
              case 'getState':
                result = await contract.getState.execute.call(this, i);
                break;
            }
            break;

          case 'chain':
            switch (operation) {
              case 'getInfo':
                result = await chain.getInfo.execute.call(this, i);
                break;
              case 'getState':
                result = await chain.getState.execute.call(this, i);
                break;
              case 'getProperties':
                result = await chain.getProperties.execute.call(this, i);
                break;
            }
            break;

          case 'network':
            switch (operation) {
              case 'getStatus':
                result = await network.getStatus.execute.call(this, i);
                break;
              case 'getPeers':
                result = await network.getPeers.execute.call(this, i);
                break;
              case 'getSyncState':
                result = await network.getSyncState.execute.call(this, i);
                break;
              case 'getVersion':
                result = await network.getVersion.execute.call(this, i);
                break;
            }
            break;

          case 'dust':
            switch (operation) {
              case 'getGenerationStatus':
                result = await dust.getGenerationStatus.execute.call(this, i);
                break;
              case 'getRegistrationStatus':
                result = await dust.getRegistrationStatus.execute.call(this, i);
                break;
            }
            break;

          case 'proof':
            switch (operation) {
              case 'getStatus':
                result = await proof.getStatus.execute.call(this, i);
                break;
              case 'listByContract':
                result = await proof.listByContract.execute.call(this, i);
                break;
            }
            break;
        }

        returnData.push(...result);
      } catch (error) {
        if (this.continueOnFail()) {
          returnData.push({
            json: {
              error: (error as Error).message,
            },
            pairedItem: { item: i },
          });
          continue;
        }
        throw error;
      }
    }

    return [returnData];
  }
}
