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
        operation: ['getState'],
      },
    },
    placeholder: '0x...',
    description: 'The address of the contract to get state for',
  },
  {
    displayName: 'State Key',
    name: 'stateKey',
    type: 'string',
    default: '',
    displayOptions: {
      show: {
        resource: ['contract'],
        operation: ['getState'],
      },
    },
    description: 'Specific state key to retrieve (leave empty for all state)',
  },
];

export async function execute(
  this: IExecuteFunctions,
  index: number,
): Promise<INodeExecutionData[]> {
  const contractAddress = this.getNodeParameter('contractAddress', index) as string;
  const stateKey = this.getNodeParameter('stateKey', index, '') as string;

  const validatedAddress = validateContractAddress(contractAddress);

  const variables: Record<string, unknown> = {
    address: validatedAddress,
  };

  if (stateKey) {
    variables.key = stateKey;
  }

  const response = await midnightGraphQLRequest.call(this, contractQueries.getState, variables);

  const data = (response as { contractState: unknown }).contractState;

  return [
    {
      json: transformToOutput(data) as IDataObject,
    },
  ];
}
