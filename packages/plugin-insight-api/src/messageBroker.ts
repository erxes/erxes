import { consumeRPCQueue } from '@erxes/api-utils/src/messageBroker';
import { generateModels } from './connectionResolver';
import { sendMessage } from '@erxes/api-utils/src/core';
import type {
  MessageArgs,
  MessageArgsOmitService,
} from '@erxes/api-utils/src/core';

export const setupMessageConsumers = async () => { };

export const sendCoreMessage = async (
  args: MessageArgsOmitService,
): Promise<any> => {
  return sendMessage({
    serviceName: 'core',
    ...args,
  });
};

export const sendCommonMessage = async (args: MessageArgs): Promise<any> => {
  return sendMessage({
    ...args,
  });
};

export const sendCardsMessage = (
  args: MessageArgsOmitService,
): Promise<any> => {
  return sendMessage({
    serviceName: 'cards',
    ...args,
  });
};

export const sendTagsMessage = async (
  args: MessageArgsOmitService,
): Promise<any> => {
  return sendMessage({
    serviceName: 'tags',
    ...args,
  });
};

export const sendSegmentsMessage = async (
  args: MessageArgsOmitService,
): Promise<any> => {
  return sendMessage({
    serviceName: 'segments',
    ...args,
  });
};
