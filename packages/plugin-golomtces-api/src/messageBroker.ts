import * as dotenv from 'dotenv';
import {
  MessageArgs,
  MessageArgsOmitService,
  sendMessage,
} from '@erxes/api-utils/src/core';

dotenv.config();

export const initBroker = async () => {};

export const sendContactsMessage = (args: MessageArgsOmitService) => {
  return sendCommonMessage({
    serviceName: 'contacts',
    ...args,
  });
};

export const sendInboxMessage = (args: MessageArgsOmitService) => {
  return sendCommonMessage({
    serviceName: 'inbox',
    ...args,
  });
};

export const sendCommonMessage = async (args: MessageArgs) => {
  return sendMessage({
    ...args,
  });
};
