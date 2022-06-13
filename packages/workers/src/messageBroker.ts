import { init as initBrokerCore } from '@erxes/api-utils/src/messageBroker';
import { RABBITMQ_QUEUES } from './constants';
import { importFromWebhook } from '../src/worker/utils';

let client;

export const initBroker = async options => {
  client = await initBrokerCore(options);

  const { consumeRPCQueue } = client;

  // listen for rpc queue =========

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

export const removeCompanies = (subdomain, _ids) =>
  sendRPCMessage('contacts:companies.removeCompanies', {
    subdomain,
    data: { _ids }
  });

export const removeCustomers = (subdomain, _ids) =>
  sendRPCMessage('contacts:customers.removeCustomers', {
    subdomain,
    data: { customerIds: _ids }
  });

export const removeTickets = (subdomain, _ids) =>
  sendRPCMessage('cards:tickets.remove', {
    subdomain,
    data: { _ids }
  });

export const removeDeals = (subdomain, _ids) =>
  sendRPCMessage('cards:deaks.remove', {
    subdomain,
    data: { _ids }
  });

export const removeTasks = (subdomain, _ids) =>
  sendRPCMessage('cards:tasks.remove', {
    subdomain,
    data: { _ids }
  });

export const getFileUploadConfigs = async () =>
  sendRPCMessage('core:getFileUploadConfigs', {});

export default function() {
  return client;
}
