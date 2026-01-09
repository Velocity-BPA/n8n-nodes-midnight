/*
 * Copyright (c) Velocity BPA, LLC
 * Licensed under the Business Source License 1.1
 * Commercial use requires a separate commercial license.
 * See LICENSE file for details.
 */

import type { IExecuteFunctions, INodeExecutionData, INodeProperties, IDataObject } from 'n8n-workflow';
import { midnightGraphQLRequest, transactionQueries } from '../../transport/graphql';
import { parsePaginationParams, transformToOutput, wrapInArray } from '../../utils';
import { PAGINATION } from '../../constants';

export const description: INodeProperties[] = [
  {
    displayName: 'Limit',
    name: 'limit',
    type: 'number',
    default: PAGINATION.DEFAULT_LIMIT,
    displayOptions: {
      show: {
        resource: ['transaction'],
        operation: ['list'],
      },
    },
    description: `Maximum number of transactions to return (max: ${PAGINATION.MAX_LIMIT})`,
    typeOptions: {
      minValue: 1,
      maxValue: PAGINATION.MAX_LIMIT,
    },
  },
  {
    displayName: 'Offset',
    name: 'offset',
    type: 'number',
    default: PAGINATION.DEFAULT_OFFSET,
    displayOptions: {
      show: {
        resource: ['transaction'],
        operation: ['list'],
      },
    },
    description: 'Number of transactions to skip for pagination',
    typeOptions: {
      minValue: 0,
    },
  },
];

export async function execute(
  this: IExecuteFunctions,
  index: number,
): Promise<INodeExecutionData[]> {
  const limit = this.getNodeParameter('limit', index, PAGINATION.DEFAULT_LIMIT) as number;
  const offset = this.getNodeParameter('offset', index, PAGINATION.DEFAULT_OFFSET) as number;
  const pagination = parsePaginationParams(limit, offset);

  const response = await midnightGraphQLRequest.call(this, transactionQueries.list, pagination);

  const data = (response as { transactions: unknown[] }).transactions;
  const outputData = wrapInArray(data).flat();

  return outputData.map((item) => ({
    json: transformToOutput(item) as IDataObject,
  }));
}
