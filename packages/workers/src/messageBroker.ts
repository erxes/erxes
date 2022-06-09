import { init as initBrokerCore } from '@erxes/api-utils/src/messageBroker';
import { RABBITMQ_QUEUES } from './constants';
import {
  importFromWebhook,
  receiveImportCreate,
  receiveImportRemove
} from '../src/worker/utils';
import { generateModels } from './connectionResolvers';
// import { sendMessage } from '@erxes/api-utils/src/core';

let client;

export const initBroker = async options => {
  client = await initBrokerCore(options);

  const { consumeRPCQueue } = client;

  // listen for rpc queue =========
  consumeRPCQueue(
    RABBITMQ_QUEUES.RPC_API_TO_WORKERS,
    async (content, subdomain) => {
      const response = { status: 'success', data: {}, errorMessage: '' };

      const models = await generateModels(subdomain);

      try {
        response.data =
          content.action === 'removeImport'
            ? await receiveImportRemove(content, models, subdomain)
            : await receiveImportCreate(content, models, subdomain);
      } catch (e) {
        response.status = 'error';
        response.errorMessage = e.message;
      }

      return response;
    }
  );

  consumeRPCQueue(RABBITMQ_QUEUES.RPC_API_TO_WEBHOOK_WORKERS, async content => {
    const response = { status: 'success', data: {}, errorMessage: '' };
    const { subdomain } = content;

    try {
      await importFromWebhook(subdomain, content);
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

export const fetchSegment = (subdomain, segmentId, options?) =>
  sendRPCMessage('segments:fetchSegment', {
    subdomain,
    data: { segmentId, options }
  });

export const getFileUploadConfigs = async () =>
  sendRPCMessage('core:getFileUploadConfigs', {});

export default function() {
  return client;
}
