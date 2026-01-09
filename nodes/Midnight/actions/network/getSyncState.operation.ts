/*
 * Copyright (c) Velocity BPA, LLC
 * Licensed under the Business Source License 1.1
 * Commercial use requires a separate commercial license.
 * See LICENSE file for details.
 */

import type { IExecuteFunctions, INodeExecutionData, INodeProperties, IDataObject } from 'n8n-workflow';
import { midnightRpcRequest, rpcMethods } from '../../transport/rpc';
import { transformToOutput } from '../../utils';

export const description: INodeProperties[] = [];

export async function execute(
  this: IExecuteFunctions,
  _index: number,
): Promise<INodeExecutionData[]> {
  const response = await midnightRpcRequest.call(this, rpcMethods.system.syncState, []);

  return [
    {
      json: transformToOutput(response) as IDataObject,
    },
  ];
}
