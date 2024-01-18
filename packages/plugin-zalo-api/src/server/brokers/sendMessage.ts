import * as dotenv from 'dotenv';
import {
  ISendMessageArgs,
  sendMessage as sendCommonMessage
} from '@erxes/api-utils/src/core';

import client from '.';



export const sendContactsMessage = (args: ISendMessageArgs) => {
  return sendCommonMessage({
    serviceName: 'contacts',
    ...args
  });
};

export const sendInboxMessage = (args: ISendMessageArgs) => {
  return sendCommonMessage({
    serviceName: 'inbox',
    timeout: 50000,
    ...args
  });
};
