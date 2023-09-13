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
        healthStatus: 'healthy',
        error: '',
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
    'imap:updateIntegration',
    async ({ subdomain, data: { integrationId, doc } }) => {
      const detail = JSON.parse(doc.data);
      const models = await generateModels(subdomain);

      const integration = await models.Integrations.findOne({
        inboxId: integrationId
      });

      if (!integration) {
        return {
          status: 'error',
          errorMessage: 'Integration not found.'
        };
      }

      detail.healthStatus = 'healthy';
      detail.error = '';

      await models.Integrations.updateOne(
        { inboxId: integrationId },
        { $set: detail }
      );

      const updatedIntegration = await models.Integrations.findOne({
        inboxId: integrationId
      });

      if (updatedIntegration) {
        await listenIntegration(subdomain, updatedIntegration);
      }

      return {
        status: 'success'
      };
    }
  );

  consumeRPCQueue(
    'imap:removeIntegrations',
    async ({ subdomain, data: { integrationId } }) => {
      const models = await generateModels(subdomain);

      await models.Messages.remove({
        inboxIntegrationId: integrationId
      });
      await models.Customers.remove({
        inboxIntegrationId: integrationId
      });
      await models.Integrations.remove({
        inboxId: integrationId
      });

      return {
        status: 'success'
      };
    }
  );

  consumeRPCQueue(
    'imap:api_to_integrations',
    async (args: ISendMessageArgs): Promise<any> => {
      const { subdomain, data } = args;
      const models = await generateModels(subdomain);

      const integrationId = data.integrationId;

      const integration = await models.Integrations.findOne({
        inboxId: integrationId
      }).select(['-_id', '-kind', '-erxesApiId', '-inboxId']);

      if (data.action === 'getDetails') {
        return {
          status: 'success',
          data: integration
        };
      }

      return {
        status: 'success'
      };
    }
  );

  // /imap/get-status'
  consumeRPCQueue(
    'imap:getStatus',
    async ({ subdomain, data: { integrationId } }) => {
      const models = await generateModels(subdomain);

      const integration = await models.Integrations.findOne({
        inboxId: integrationId
      });

      let result = {
        status: 'healthy'
      } as any;

      if (integration) {
        result = {
          status: integration.healthStatus || 'healthy',
          error: integration.error
        };
      }

      return {
        data: result,
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
