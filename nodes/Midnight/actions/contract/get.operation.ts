/*
 * Copyright (c) Velocity BPA, LLC
 * Licensed under the Business Source License 1.1
 * Commercial use requires a separate commercial license.
 * See LICENSE file for details.
 */

import type { IExecuteFunctions, INodeExecutionData, INodeProperties, IDataObject } from 'n8n-workflow';
import { midnightGraphQLRequest, contractQueries } from '../../transport/graphql';
import { validateContractAddress, transformToOutput } from '../../utils';

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
        operation: ['get'],
      },
    },
    placeholder: '0x...',
    description: 'The address of the contract to retrieve',
  },
];

export async function execute(
  this: IExecuteFunctions,
  index: number,
): Promise<INodeExecutionData[]> {
  const contractAddress = this.getNodeParameter('contractAddress', index) as string;
  const validatedAddress = validateContractAddress(contractAddress);

  const response = await midnightGraphQLRequest.call(this, contractQueries.get, {
    address: validatedAddress,
  });

  const data = (response as { contract: unknown }).contract;

  return [
    {
      json: transformToOutput(data) as IDataObject,
    },
  ];
}
