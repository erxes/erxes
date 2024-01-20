import * as dotenv from 'dotenv';
import {
  MessageArgs,
  sendMessage as sendCommonMessage,
} from '@erxes/api-utils/src/core';

import client from '.';

export const sendContactsMessage = (args: MessageArgs) => {
  return sendCommonMessage({
    serviceName: 'contacts',
    ...args,
  });
};

export const sendInboxMessage = (args: MessageArgs) => {
  return sendCommonMessage({
    serviceName: 'inbox',
    timeout: 50000,
    ...args,
  });
};
