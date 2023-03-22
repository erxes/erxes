import * as dotenv from 'dotenv';
import {
  ISendMessageArgs,
  sendMessage as sendCommonMessage
} from '@erxes/api-utils/src/core';
import { serviceDiscovery } from './configs';
import { generateModels } from './connectionResolver';
import { listenIntegration } from './utils';

dotenv.config();

let client;

export const initBroker = async cl => {
  client = cl;

  const { consumeRPCQueue } = client;

  consumeRPCQueue(
    'imap:createIntegration',
    async ({ subdomain, data: { doc, integrationId } }) => {
      const models = await generateModels(subdomain);

      const integration = await models.Integrations.create({
        inboxId: integrationId,
        ...JSON.parse(doc.data)
      });

      await listenIntegration(subdomain, integration);

      await models.Logs.createLog({
        type: 'info',
        message: `Started syncing ${integration.user}`
      });

      return {
        status: 'success'
      };
    }
  );

  consumeRPCQueue(
    'imap:removeIntegrations',
    async ({ subdomain, data: { integrationId } }) => {
      const models = await generateModels(subdomain);

      await models.Messages.remove({ inboxIntegrationId: integrationId });
      await models.Customers.remove({ inboxIntegrationId: integrationId });
      await models.Integrations.remove({ inboxId: integrationId });

      return {
        status: 'success'
      };
    }
  );
};

export default function() {
  return client;
}

export const sendContactsMessage = (args: ISendMessageArgs) => {
  return sendCommonMessage({
    client,
    serviceDiscovery,
    serviceName: 'contacts',
    ...args
  });
};

export const sendInboxMessage = (args: ISendMessageArgs) => {
  return sendCommonMessage({
    client,
    serviceDiscovery,
    serviceName: 'inbox',
    ...args
  });
};
