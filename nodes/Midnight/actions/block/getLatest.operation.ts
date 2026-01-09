/*
 * Copyright (c) Velocity BPA, LLC
 * Licensed under the Business Source License 1.1
 * Commercial use requires a separate commercial license.
 * See LICENSE file for details.
 */

import type { IExecuteFunctions, INodeExecutionData, INodeProperties, IDataObject } from 'n8n-workflow';
import { midnightGraphQLRequest, blockQueries } from '../../transport/graphql';
import { transformToOutput } from '../../utils';

export const description: INodeProperties[] = [];

export async function execute(
  this: IExecuteFunctions,
  _index: number,
): Promise<INodeExecutionData[]> {
  const response = await midnightGraphQLRequest.call(this, blockQueries.getLatest, {});

  const data = (response as { latestBlock: unknown }).latestBlock;

  return [
    {
      json: transformToOutput(data) as IDataObject,
    },
  ];
}
