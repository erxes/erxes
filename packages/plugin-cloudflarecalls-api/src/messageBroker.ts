import { sendMessage } from '@erxes/api-utils/src/core';
import type {
  MessageArgs,
  MessageArgsOmitService,
} from '@erxes/api-utils/src/core';
import { generateModels } from './connectionResolver';
import {
  consumeQueue,
  consumeRPCQueue,
} from '@erxes/api-utils/src/messageBroker';
import type {
  InterMessage,
  RPResult,
} from '@erxes/api-utils/src/messageBroker';
import { removeCustomers } from './helpers';

export const setupMessageConsumers = async () => {
  consumeRPCQueue(
    'cloudflarecalls:createIntegration',
    async (args: InterMessage): Promise<any> => {
      const { subdomain, data } = args;
      const { integrationId, doc } = data;
      const models = generateModels(subdomain);
      const docData = JSON.parse(doc.data);
      await (
        await models
      ).Integrations.create({
        erxesApiId: integrationId,
        status: 'active',
        ...docData,
      });

      return {
        status: 'success',
      };
    },
  );

  consumeRPCQueue(
    'cloudflarecalls:api_to_integrations',
    async (args: InterMessage): Promise<RPResult> => {
      const { subdomain, data } = args;
      const { integrationId, action } = data;

      const models = await generateModels(subdomain);

      const integration = await models.Integrations.findOne({
        erxesApiId: integrationId,
      }).lean();

      if (!integration) {
        return {
          status: 'error',
          errorMessage: 'integration not found.',
        };
      }

      if (action === 'getDetails') {
        return {
          status: 'success',
          data: {
            ...integration,
            isReceiveWebCall: Boolean(integration.status || false),
          },
        };
      }

      return {
        status: 'success',
      };
    },
  );

  consumeRPCQueue(
    'cloudflarecalls:updateIntegration',
    async ({ subdomain, data: { integrationId, doc } }) => {
      const details = JSON.parse(doc.data);
      const models = await generateModels(subdomain);

      const integration = await models.Integrations.findOne({
        erxesApiId: integrationId,
      });

      if (!integration) {
        return {
          status: 'error',
          errorMessage: 'Integration not found.',
        };
      }

      let queues;
      if (typeof details?.queues === 'string') {
        queues = details.queues.split(',');
      } else {
        queues = [];
      }

      await models.Integrations.updateOne(
        { erxesApiId: integrationId },
        { $set: { ...details, queues: queues } },
      );

      const updatedIntegration = await models.Integrations.findOne({
        erxesApiId: integrationId,
      });

      if (updatedIntegration) {
        return {
          status: 'success',
        };
      } else {
        return {
          status: 'error',
          errorMessage: 'Integration not found.',
        };
      }
    },
  );

  consumeRPCQueue(
    'cloudflarecalls:createOrUpdateIntegration',
    async ({ subdomain, data: { integrationId, doc } }) => {
      const details = JSON.parse(JSON.stringify(doc.data));
      const models = await generateModels(subdomain);
      let status = 'inactive';
      if (details.isReceiveWebCall) {
        status = 'active';
      }
      const updatedIntegration =
        await models.Integrations.createOrUpdateIntegration(integrationId, {
          ...details,
          status: status,
        });

      if (updatedIntegration) {
        return {
          status: 'success',
        };
      } else {
        return {
          status: 'error',
          errorMessage: 'Integration not found.',
        };
      }
    },
  );

  consumeRPCQueue(
    'cloudflarecalls:removeIntegrations',
    async ({ subdomain, data: { integrationId } }) => {
      const models = await generateModels(subdomain);

      await models.Integrations.deleteOne({ erxesApiId: integrationId });
      await models.Customers.deleteMany({ inboxIntegrationId: integrationId });

      return {
        status: 'success',
      };
    },
  );

  consumeRPCQueue(
    'cloudflarecalls:integrationDetail',
    async (args: InterMessage): Promise<any> => {
      const { subdomain, data } = args;
      const { erxesApiId } = data;

      const models = await generateModels(subdomain);

      const callIntegration = await models.Integrations.findOne(
        { erxesApiId },
        '_id',
      );

      return {
        status: 'success',
        data: { id: callIntegration?._id },
      };
    },
  );
  consumeQueue('cloudflarecalls:notification', async ({ subdomain, data }) => {
    const models = await generateModels(subdomain);

    const { type } = data;

    switch (type) {
      case 'removeCustomers':
        await removeCustomers(models, data);
        break;

      default:
        break;
    }
  });
  consumeRPCQueue(
    'cloudflarecalls:getCallHistory',
    async (args: InterMessage): Promise<any> => {
      try {
        const { subdomain, data } = args;
        const models = await generateModels(subdomain);
        const { erxesApiConversationId } = data;
        if (!erxesApiConversationId) {
          return {
            status: 'error',
            errorMessage: 'Conversation id not found.',
          };
        }

        const history = await models.CallHistory.findOne({
          conversationId: erxesApiConversationId,
        });
        return {
          status: 'success',
          data: history,
        };
      } catch (error) {
        return {
          status: 'error',
          errorMessage: 'Error processing call history:' + error,
        };
      }
    },
  );
};

export const sendCommonMessage = async (args: MessageArgs) => {
  return sendMessage({
    ...args,
  });
};

export const sendInboxMessage = (args: MessageArgsOmitService) => {
  return sendCommonMessage({
    serviceName: 'inbox',
    ...args,
  });
};

export const sendCoreMessage = async (
  args: MessageArgsOmitService,
): Promise<any> => {
  return sendMessage({
    serviceName: 'core',
    ...args,
  });
};

export const sendIntegrationsMessage = (
  args: MessageArgsOmitService,
): Promise<any> => {
  return sendMessage({
    serviceName: 'integrations',
    ...args,
  });
};
