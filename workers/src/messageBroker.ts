import * as dotenv from 'dotenv';
import messageBroker from 'erxes-message-broker';
import { RABBITMQ_QUEUES } from './constants';

import {
  importFromWebhook,
  receiveImportCancel,
  receiveImportCreate,
  receiveImportRemove
} from './utils';

dotenv.config();

let client;

export const initBroker = async (server?) => {
  client = await messageBroker({
    name: 'workers',
    server,
    envs: process.env
  });

  const { consumeQueue, consumeRPCQueue } = client;

  // listen for rpc queue =========
  consumeRPCQueue(RABBITMQ_QUEUES.RPC_API_TO_WORKERS, async content => {
    const response = { status: 'success', data: {}, errorMessage: '' };

    try {
      response.data =
        content.action === 'removeImport'
          ? await receiveImportRemove(content)
          : await receiveImportCreate(content);
    } catch (e) {
      response.status = 'error';
      response.errorMessage = e.message;
    }

    return response;
  });

  consumeRPCQueue(RABBITMQ_QUEUES.RPC_API_TO_WEBHOOK_WORKERS, async content => {
    const response = { status: 'success', data: {}, errorMessage: '' };

    try {
      await importFromWebhook(content);
    } catch (e) {
      response.status = 'error';
      response.errorMessage = e.message;
    }

    return response;
  });

  consumeQueue(RABBITMQ_QUEUES.WORKERS, async content => {
    if (content.type === 'cancelImport') {
      receiveImportCancel();
    }
  });

  return client;
};

export const sendRPCMessage = async (channel, message): Promise<any> => {
  return client.sendRPCMessage(channel, message);
};

export const updateImportHistory = async (args): Promise<any> => {
  return client.sendRPCMessage('core:importHistory.updateOne', args);
};

export const findImportHistory = async (args): Promise<any> => {
  return client.sendRPCMessage('core:importHistory.findOne', args);
};

export const getAwsConfigs = async (): Promise<any> => {
  return client.sendRPCMessage('core:getAwsConfigs');
};

export default function() {
  return client;
}
