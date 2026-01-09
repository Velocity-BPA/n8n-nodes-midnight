/*
 * Copyright (c) Velocity BPA, LLC
 * Licensed under the Business Source License 1.1
 * Commercial use requires a separate commercial license.
 * See LICENSE file for details.
 */

import type { IExecuteFunctions, INodeExecutionData, INodeProperties, IDataObject } from 'n8n-workflow';
import { midnightGraphQLRequest, transactionQueries } from '../../transport/graphql';
import { validateBlockHash, transformToOutput, wrapInArray } from '../../utils';
import { PAGINATION } from '../../constants';

export const description: INodeProperties[] = [
  {
    displayName: 'Block Hash',
    name: 'blockHash',
    type: 'string',
    required: true,
    default: '',
    displayOptions: {
      show: {
        resource: ['transaction'],
        operation: ['listByBlock'],
      },
    },
    placeholder: '0x...',
    description: 'The hash of the block to get transactions from',
  },
  {
    displayName: 'Limit',
    name: 'limit',
    type: 'number',
    default: PAGINATION.DEFAULT_LIMIT,
    displayOptions: {
      show: {
        resource: ['transaction'],
        operation: ['listByBlock'],
      },
    },
    description: `Maximum number of transactions to return (max: ${PAGINATION.MAX_LIMIT})`,
    typeOptions: {
      minValue: 1,
      maxValue: PAGINATION.MAX_LIMIT,
    },
  },
];

export async function execute(
  this: IExecuteFunctions,
  index: number,
): Promise<INodeExecutionData[]> {
  const blockHash = this.getNodeParameter('blockHash', index) as string;
  const limit = this.getNodeParameter('limit', index, PAGINATION.DEFAULT_LIMIT) as number;

  const validatedHash = validateBlockHash(blockHash);

  const response = await midnightGraphQLRequest.call(this, transactionQueries.listByBlock, {
    blockHash: validatedHash,
    limit: Math.min(limit, PAGINATION.MAX_LIMIT),
  });

  const data = (response as { blockTransactions: unknown[] }).blockTransactions;
  const outputData = wrapInArray(data).flat();

  return outputData.map((item) => ({
    json: transformToOutput(item) as IDataObject,
  }));
}
