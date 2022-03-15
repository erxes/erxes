import { init as initBrokerCore } from '@erxes/api-utils/src/messageBroker';
import { RABBITMQ_QUEUES } from './constants';
import {
  importFromWebhook,
  receiveImportCreate,
  receiveImportRemove
} from '../src/worker/utils';

let client;

export const initBroker = async options => {
  client = await initBrokerCore(options);

  const { consumeRPCQueue } = client;

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

  return client;
};

export const sendRPCMessage = async (channel, message): Promise<any> => {
  return client.sendRPCMessage(channel, message);
};

export const fetchSegment = (segmentId, options?) =>
  sendRPCMessage('segments:rpc_queue:fetchSegment', {
    segmentId,
    options
  });

export const getFileUploadConfigs = () =>
  sendRPCMessage('core:rpc_queue:getFileUploadConfigs', {});

export default function() {
  return client;
}
