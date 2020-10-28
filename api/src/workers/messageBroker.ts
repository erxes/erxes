import * as dotenv from 'dotenv';
import messageBroker from 'erxes-message-broker';
import { RABBITMQ_QUEUES } from '../data/constants';
import {
  receiveImportCancel,
  receiveImportCreate,
  receiveImportRemove
} from './utils';

dotenv.config();

let client;

export const initBroker = async server => {
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

  consumeQueue(RABBITMQ_QUEUES.WORKERS, async content => {
    if (content.type === 'cancelImport') {
      receiveImportCancel();
    }
  });
};

export default function() {
  return client;
}
