/*
 * Copyright (c) Velocity BPA, LLC
 * Licensed under the Business Source License 1.1
 * Commercial use requires a separate commercial license.
 * See LICENSE file for details.
 */

import type { IExecuteFunctions, INodeExecutionData, INodeProperties, IDataObject } from 'n8n-workflow';
import { midnightGraphQLRequest, blockQueries } from '../../transport/graphql';
import { validateBlockHash, transformToOutput } from '../../utils';

export const description: INodeProperties[] = [
  {
    displayName: 'Block Hash',
    name: 'blockHash',
    type: 'string',
    required: true,
    default: '',
    displayOptions: {
      show: {
        resource: ['block'],
        operation: ['getByHash'],
      },
    },
    placeholder: '0x...',
    description: 'The hash of the block to retrieve',
  },
];

export async function execute(
  this: IExecuteFunctions,
  index: number,
): Promise<INodeExecutionData[]> {
  const blockHash = this.getNodeParameter('blockHash', index) as string;
  const validatedHash = validateBlockHash(blockHash);

  const response = await midnightGraphQLRequest.call(this, blockQueries.getByHash, {
    hash: validatedHash,
  });

  const data = (response as { block: unknown }).block;

  return [
    {
      json: transformToOutput(data) as IDataObject,
    },
  ];
}
