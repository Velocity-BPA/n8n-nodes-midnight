/*
 * Copyright (c) Velocity BPA, LLC
 * Licensed under the Business Source License 1.1
 * Commercial use requires a separate commercial license.
 * See LICENSE file for details.
 */

import type { IExecuteFunctions, INodeExecutionData, INodeProperties, IDataObject } from 'n8n-workflow';
import { midnightGraphQLRequest, dustQueries } from '../../transport/graphql';
import { validateStakeKey, transformToOutput } from '../../utils';

export const description: INodeProperties[] = [
  {
    displayName: 'Stake Key',
    name: 'stakeKey',
    type: 'string',
    required: true,
    default: '',
    displayOptions: {
      show: {
        resource: ['dust'],
        operation: ['getGenerationStatus'],
      },
    },
    placeholder: 'stake1...',
    description: 'The Cardano stake key to check DUST generation status for',
  },
];

export async function execute(
  this: IExecuteFunctions,
  index: number,
): Promise<INodeExecutionData[]> {
  const stakeKey = this.getNodeParameter('stakeKey', index) as string;
  const validatedStakeKey = validateStakeKey(stakeKey);

  const response = await midnightGraphQLRequest.call(this, dustQueries.getGenerationStatus, {
    stakeKey: validatedStakeKey,
  });

  const data = (response as { dustGenerationStatus: unknown }).dustGenerationStatus;

  return [
    {
      json: transformToOutput(data) as IDataObject,
    },
  ];
}
