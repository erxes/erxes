import { ISendMessageArgs, sendMessage } from '@erxes/api-utils/src/core';
import { serviceDiscovery } from './configs';
import { generateToken } from './utils';
import { generateModels } from './connectionResolver';

let client;

export const initBroker = async cl => {
  client = cl;

  const { consumeQueue, consumeRPCQueue } = client;

  consumeRPCQueue(
    'calls:createIntegration',
    async (args: ISendMessageArgs): Promise<any> => {
      const { subdomain, data } = args;
      const { integrationId, doc } = data;
      const models = generateModels(subdomain);
      const docData = JSON.parse(doc.data);

      const token = await generateToken(integrationId);

      await (await models).Integrations.create({
        inboxId: integrationId,
        token,
        ...docData
      });

      return {
        status: 'success'
      };
    }
  );

  consumeRPCQueue(
    'calls:api_to_integrations',
    async (args: ISendMessageArgs): Promise<any> => {
      const { subdomain, data } = args;
      const { inboxId, action } = data;

      const models = await generateModels(subdomain);

      const integration = await models.Integrations.findOne({ inboxId });

      if (!integration) {
        return {
          status: 'failed',
          data: 'integration not found.'
        };
      }

      if (action === 'getDetails') {
        return {
          status: 'success',
          data: integration
        };
      }

      return {
        status: 'success'
      };
    },

    consumeRPCQueue(
      'calls:updateIntegration',
      async ({ subdomain, data: { integrationId, doc } }) => {
        const details = JSON.parse(doc.data);
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

        await models.Integrations.updateOne(
          { inboxId: integrationId },
          { $set: details }
        );

        const updatedIntegration = await models.Integrations.findOne({
          inboxId: integrationId
        });

        if (updatedIntegration) {
          return {
            status: 'success'
          };
        } else
          err => {
            return {
              err
            };
          };
      }
    ),

    consumeRPCQueue(
      'calls:removeIntegrations',
      async ({ subdomain, data: { integrationId } }) => {
        const models = await generateModels(subdomain);

        await models.Integrations.deleteOne({ inboxId: integrationId });

        return {
          status: 'success'
        };
      }
    ),

    consumeRPCQueue(
      'viber:integrationDetail',
      async (args: ISendMessageArgs): Promise<any> => {
        const { subdomain, data } = args;
        const { inboxId } = data;

        const models = await generateModels(subdomain);

        const callIntegration = await models.Integrations.findOne(
          { inboxId },
          'token'
        );

        return {
          status: 'success',
          data: { token: callIntegration?.token }
        };
      }
    )
  );
};

export const sendCommonMessage = async (
  args: ISendMessageArgs & { serviceName: string }
) => {
  return sendMessage({
    serviceDiscovery,
    client,
    ...args
  });
};

export const sendInboxMessage = (args: ISendMessageArgs) => {
  return sendCommonMessage({
    serviceName: 'inbox',
    ...args
  });
};

export default function() {
  return client;
}
