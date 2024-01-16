import * as dotenv from 'dotenv';
import { ISendMessageArgs, sendMessage } from '@erxes/api-utils/src/core';

dotenv.config();

let client;

export const initBroker = async cl => {
  client = cl;
};

export default function() {
  return client;
}

export const sendContactsMessage = (args: ISendMessageArgs) => {
  return sendMessage({
    client,
    serviceName: 'contacts',
    ...args
  });
};

export const sendInboxMessage = (args: ISendMessageArgs) => {
  return sendMessage({
    client,
    serviceName: 'inbox',
    ...args
  });
};

export const sendCommonMessage = async (
  args: ISendMessageArgs & { serviceName: string }
) => {
  return sendMessage({
    client,
    ...args
  });
};
