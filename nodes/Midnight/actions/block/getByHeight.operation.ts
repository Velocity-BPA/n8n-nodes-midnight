/*
 * Copyright (c) Velocity BPA, LLC
 * Licensed under the Business Source License 1.1
 * Commercial use requires a separate commercial license.
 * See LICENSE file for details.
 */

import type { IExecuteFunctions, INodeExecutionData, INodeProperties, IDataObject } from 'n8n-workflow';
import { midnightGraphQLRequest, blockQueries } from '../../transport/graphql';
import { parseBlockHeight, transformToOutput } from '../../utils';

export const description: INodeProperties[] = [
  {
    displayName: 'Block Height',
    name: 'blockHeight',
    type: 'number',
    required: true,
    default: 0,
    displayOptions: {
      show: {
        resource: ['block'],
        operation: ['getByHeight'],
      },
    },
    description: 'The height of the block to retrieve',
  },
];

export async function execute(
  this: IExecuteFunctions,
  index: number,
): Promise<INodeExecutionData[]> {
  const blockHeight = this.getNodeParameter('blockHeight', index) as number;
  const validatedHeight = parseBlockHeight(blockHeight);

  const response = await midnightGraphQLRequest.call(this, blockQueries.getByHeight, {
    height: validatedHeight,
  });

  const data = (response as { blockByHeight: unknown }).blockByHeight;

  return [
    {
      json: transformToOutput(data) as IDataObject,
    },
  ];
}
