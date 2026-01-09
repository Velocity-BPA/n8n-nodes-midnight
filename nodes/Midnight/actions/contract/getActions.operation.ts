/*
 * Copyright (c) Velocity BPA, LLC
 * Licensed under the Business Source License 1.1
 * Commercial use requires a separate commercial license.
 * See LICENSE file for details.
 */

import type { IExecuteFunctions, INodeExecutionData, INodeProperties, IDataObject } from 'n8n-workflow';
import { midnightGraphQLRequest, contractQueries } from '../../transport/graphql';
import { validateContractAddress, transformToOutput, wrapInArray } from '../../utils';
import { PAGINATION } from '../../constants';

export const description: INodeProperties[] = [
  {
    displayName: 'Contract Address',
    name: 'contractAddress',
    type: 'string',
    required: true,
    default: '',
    displayOptions: {
      show: {
        resource: ['contract'],
        operation: ['getActions'],
      },
    },
    placeholder: '0x...',
    description: 'The address of the contract to get actions for',
  },
  {
    displayName: 'Limit',
    name: 'limit',
    type: 'number',
    default: PAGINATION.DEFAULT_LIMIT,
    displayOptions: {
      show: {
        resource: ['contract'],
        operation: ['getActions'],
      },
    },
    description: `Maximum number of actions to return (max: ${PAGINATION.MAX_LIMIT})`,
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
  const contractAddress = this.getNodeParameter('contractAddress', index) as string;
  const limit = this.getNodeParameter('limit', index, PAGINATION.DEFAULT_LIMIT) as number;

  const validatedAddress = validateContractAddress(contractAddress);

  const response = await midnightGraphQLRequest.call(this, contractQueries.getActions, {
    address: validatedAddress,
    limit: Math.min(limit, PAGINATION.MAX_LIMIT),
  });

  const data = (response as { contractActions: unknown[] }).contractActions;
  const outputData = wrapInArray(data).flat();

  return outputData.map((item) => ({
    json: transformToOutput(item) as IDataObject,
  }));
}
