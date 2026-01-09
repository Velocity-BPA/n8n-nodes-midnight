/*
 * Copyright (c) Velocity BPA, LLC
 * Licensed under the Business Source License 1.1
 * Commercial use requires a separate commercial license.
 * See LICENSE file for details.
 */

import type {
  ITriggerFunctions,
  INodeType,
  INodeTypeDescription,
  ITriggerResponse,
} from 'n8n-workflow';

import {
  MidnightRpcSubscription,
  MidnightGraphQLSubscription,
} from './transport/rpc';
import { subscriptions } from './transport/graphql';
import { logLicenseNotice, transformToOutput } from './utils';
import { POLLING_INTERVALS } from './constants';

export class MidnightTrigger implements INodeType {
  description: INodeTypeDescription = {
    displayName: 'Midnight Trigger',
    name: 'midnightTrigger',
    icon: 'file:midnight.svg',
    group: ['trigger'],
    version: 1,
    subtitle: '={{$parameter["event"]}}',
    description:
      'Triggers workflow on Midnight blockchain events using WebSocket subscriptions',
    defaults: {
      name: 'Midnight Trigger',
    },
    inputs: [],
    outputs: ['main'],
    credentials: [
      {
        name: 'midnightApi',
        required: true,
      },
    ],
    properties: [
      {
        displayName: 'Event',
        name: 'event',
        type: 'options',
        noDataExpression: true,
        options: [
          {
            name: 'New Block',
            value: 'newBlock',
            description: 'Trigger on new blocks',
          },
          {
            name: 'New Block from Height',
            value: 'newBlockFromHeight',
            description: 'Trigger on new blocks starting from a specific height',
          },
          {
            name: 'Finalized Block',
            value: 'finalizedBlock',
            description: 'Trigger on finalized blocks',
          },
          {
            name: 'Contract Action',
            value: 'contractAction',
            description: 'Trigger on actions for a specific contract',
          },
          {
            name: 'New Head (RPC)',
            value: 'newHead',
            description: 'Trigger on new block headers via JSON-RPC',
          },
          {
            name: 'Finalized Heads (RPC)',
            value: 'finalizedHeads',
            description: 'Trigger on finalized block headers via JSON-RPC',
          },
        ],
        default: 'newBlock',
      },
      {
        displayName: 'Starting Height',
        name: 'startHeight',
        type: 'number',
        default: 0,
        displayOptions: {
          show: {
            event: ['newBlockFromHeight'],
          },
        },
        description: 'Block height to start receiving events from',
      },
      {
        displayName: 'Contract Address',
        name: 'contractAddress',
        type: 'string',
        default: '',
        required: true,
        displayOptions: {
          show: {
            event: ['contractAction'],
          },
        },
        placeholder: '0x...',
        description: 'The contract address to watch for actions',
      },
      {
        displayName: 'Options',
        name: 'options',
        type: 'collection',
        placeholder: 'Add Option',
        default: {},
        options: [
          {
            displayName: 'Reconnect on Error',
            name: 'reconnectOnError',
            type: 'boolean',
            default: true,
            description: 'Whether to automatically reconnect on connection errors',
          },
          {
            displayName: 'Max Reconnect Attempts',
            name: 'maxReconnectAttempts',
            type: 'number',
            default: 5,
            description: 'Maximum number of reconnection attempts',
            displayOptions: {
              show: {
                reconnectOnError: [true],
              },
            },
          },
        ],
      },
    ],
  };

  async trigger(this: ITriggerFunctions): Promise<ITriggerResponse> {
    // Log licensing notice once per node load
    logLicenseNotice(this.logger);

    const event = this.getNodeParameter('event') as string;
    const credentials = await this.getCredentials('midnightApi');
    const options = this.getNodeParameter('options', {}) as {
      reconnectOnError?: boolean;
      maxReconnectAttempts?: number;
    };

    let subscription: MidnightRpcSubscription | MidnightGraphQLSubscription | null = null;
    let reconnectAttempts = 0;
    const maxAttempts = options.maxReconnectAttempts ?? 5;
    const reconnectOnError = options.reconnectOnError ?? true;

    const emitEvent = (data: unknown) => {
      const output = transformToOutput(data);
      this.emit([this.helpers.returnJsonArray(output)]);
    };

    const setupSubscription = async () => {
      try {
        switch (event) {
          case 'newBlock':
            subscription = new MidnightGraphQLSubscription(credentials);
            await (subscription as MidnightGraphQLSubscription).subscribe(
              subscriptions.newBlock,
              {},
              (data) => {
                const blocks = (data as { blocks: unknown }).blocks;
                emitEvent(blocks);
              },
            );
            break;

          case 'newBlockFromHeight': {
            const startHeight = this.getNodeParameter('startHeight') as number;
            subscription = new MidnightGraphQLSubscription(credentials);
            await (subscription as MidnightGraphQLSubscription).subscribe(
              subscriptions.newBlockFromHeight,
              { height: startHeight },
              (data) => {
                const blocks = (data as { blocks: unknown }).blocks;
                emitEvent(blocks);
              },
            );
            break;
          }

          case 'finalizedBlock':
            subscription = new MidnightGraphQLSubscription(credentials);
            await (subscription as MidnightGraphQLSubscription).subscribe(
              subscriptions.finalizedBlock,
              {},
              (data) => {
                const finalizedBlocks = (data as { finalizedBlocks: unknown }).finalizedBlocks;
                emitEvent(finalizedBlocks);
              },
            );
            break;

          case 'contractAction': {
            const contractAddress = this.getNodeParameter('contractAddress') as string;
            subscription = new MidnightGraphQLSubscription(credentials);
            await (subscription as MidnightGraphQLSubscription).subscribe(
              subscriptions.contractAction,
              { address: contractAddress },
              (data) => {
                const action = (data as { contractAction: unknown }).contractAction;
                emitEvent(action);
              },
            );
            break;
          }

          case 'newHead':
            subscription = new MidnightRpcSubscription(credentials);
            await (subscription as MidnightRpcSubscription).subscribe(
              'chain_subscribeNewHeads',
              [],
              emitEvent,
            );
            break;

          case 'finalizedHeads':
            subscription = new MidnightRpcSubscription(credentials);
            await (subscription as MidnightRpcSubscription).subscribe(
              'chain_subscribeFinalizedHeads',
              [],
              emitEvent,
            );
            break;
        }

        reconnectAttempts = 0;
      } catch (error) {
        if (reconnectOnError && reconnectAttempts < maxAttempts) {
          reconnectAttempts++;
          this.logger.warn(
            `Subscription error, attempting reconnect (${reconnectAttempts}/${maxAttempts}): ${(error as Error).message}`,
          );
          await new Promise((resolve) =>
            setTimeout(resolve, POLLING_INTERVALS.DEFAULT),
          );
          await setupSubscription();
        } else {
          throw error;
        }
      }
    };

    await setupSubscription();

    const closeFunction = async () => {
      if (subscription) {
        if (subscription instanceof MidnightRpcSubscription) {
          const unsubMethod =
            event === 'newHead'
              ? 'chain_unsubscribeNewHeads'
              : 'chain_unsubscribeFinalizedHeads';
          await subscription.unsubscribe(unsubMethod);
        } else if (subscription instanceof MidnightGraphQLSubscription) {
          subscription.close();
        }
      }
    };

    return {
      closeFunction,
    };
  }
}
