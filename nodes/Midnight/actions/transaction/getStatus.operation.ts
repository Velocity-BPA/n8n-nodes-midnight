/*
 * Copyright (c) Velocity BPA, LLC
 * Licensed under the Business Source License 1.1
 * Commercial use requires a separate commercial license.
 * See LICENSE file for details.
 */

import type { IExecuteFunctions, INodeExecutionData, INodeProperties, IDataObject } from 'n8n-workflow';
import { midnightGraphQLRequest, transactionQueries } from '../../transport/graphql';
import { validateTransactionHash, transformToOutput } from '../../utils';

export const description: INodeProperties[] = [
  {
    displayName: 'Transaction Hash',
    name: 'transactionHash',
    type: 'string',
    required: true,
    default: '',
    displayOptions: {
      show: {
        resource: ['transaction'],
        operation: ['getStatus'],
      },
    },
    placeholder: '0x...',
    description: 'The hash of the transaction to check status',
  },
];

export async function execute(
  this: IExecuteFunctions,
  index: number,
): Promise<INodeExecutionData[]> {
  const transactionHash = this.getNodeParameter('transactionHash', index) as string;
  const validatedHash = validateTransactionHash(transactionHash);

  const response = await midnightGraphQLRequest.call(this, transactionQueries.getStatus, {
    hash: validatedHash,
  });

  const data = (response as { transactionStatus: unknown }).transactionStatus;

  return [
    {
      json: transformToOutput(data) as IDataObject,
    },
  ];
}
