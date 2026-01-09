/*
 * Copyright (c) Velocity BPA, LLC
 * Licensed under the Business Source License 1.1
 * Commercial use requires a separate commercial license.
 * See LICENSE file for details.
 */

import type { IExecuteFunctions, INodeExecutionData, INodeProperties, IDataObject } from 'n8n-workflow';
import { midnightGraphQLRequest, proofQueries } from '../../transport/graphql';
import { validateProofId, transformToOutput } from '../../utils';

export const description: INodeProperties[] = [
  {
    displayName: 'Proof ID',
    name: 'proofId',
    type: 'string',
    required: true,
    default: '',
    displayOptions: {
      show: {
        resource: ['proof'],
        operation: ['getStatus'],
      },
    },
    description: 'The ID of the zero-knowledge proof to check status for',
  },
];

export async function execute(
  this: IExecuteFunctions,
  index: number,
): Promise<INodeExecutionData[]> {
  const proofId = this.getNodeParameter('proofId', index) as string;
  const validatedProofId = validateProofId(proofId);

  const response = await midnightGraphQLRequest.call(this, proofQueries.getStatus, {
    proofId: validatedProofId,
  });

  const data = (response as { proofStatus: unknown }).proofStatus;

  return [
    {
      json: transformToOutput(data) as IDataObject,
    },
  ];
}
