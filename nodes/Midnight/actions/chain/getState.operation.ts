/*
 * Copyright (c) Velocity BPA, LLC
 * Licensed under the Business Source License 1.1
 * Commercial use requires a separate commercial license.
 * See LICENSE file for details.
 */

import type { IExecuteFunctions, INodeExecutionData, INodeProperties, IDataObject } from 'n8n-workflow';
import { midnightRpcRequest, rpcMethods } from '../../transport/rpc';
import { transformToOutput } from '../../utils';

export const description: INodeProperties[] = [
  {
    displayName: 'Block Hash (Optional)',
    name: 'blockHash',
    type: 'string',
    default: '',
    displayOptions: {
      show: {
        resource: ['chain'],
        operation: ['getState'],
      },
    },
    placeholder: '0x...',
    description: 'Block hash to get header for (leave empty for latest)',
  },
];

export async function execute(
  this: IExecuteFunctions,
  index: number,
): Promise<INodeExecutionData[]> {
  const blockHash = this.getNodeParameter('blockHash', index, '') as string;

  const params = blockHash ? [blockHash] : [];
  const response = await midnightRpcRequest.call(this, rpcMethods.chain.getHeader, params);

  return [
    {
      json: transformToOutput(response) as IDataObject,
    },
  ];
}
