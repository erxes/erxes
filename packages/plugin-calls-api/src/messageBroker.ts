import { sendMessage } from '@erxes/api-utils/src/core';
import type {
  MessageArgs,
  MessageArgsOmitService,
} from '@erxes/api-utils/src/core';
import { getDomain } from './utils';
import { generateModels } from './connectionResolver';
import {
  consumeQueue,
  consumeRPCQueue,
} from '@erxes/api-utils/src/messageBroker';
import type {
  InterMessage,
  RPResult,
} from '@erxes/api-utils/src/messageBroker';
import { callsCreateIntegration, removeCustomers } from './helpers';
import { getEnv } from '@erxes/api-utils/src/core';

export const setupMessageConsumers = async () => {
  consumeRPCQueue('calls:createIntegration', async ({ subdomain, data }) => {
    const models = await generateModels(subdomain);
    if (data.kind === 'calls') {
      return callsCreateIntegration(subdomain, models, data.doc);
    }
    return {
      status: 'error',
      errorMessage: 'Wrong kind',
    };
  });

  consumeRPCQueue(
    'calls:api_to_integrations',
    async (args: InterMessage): Promise<RPResult> => {
      const { subdomain, data } = args;
      const { integrationId, action } = data;

      const models = await generateModels(subdomain);

      const integration = await models.Integrations.findOne({
        inboxId: integrationId,
      });

      if (!integration) {
        return {
          status: 'error',
          errorMessage: 'integration not found.',
        };
      }

      if (action === 'getDetails') {
        return {
          status: 'success',
          data: integration,
        };
      }

      return {
        status: 'success',
      };
    },
  );

  consumeRPCQueue(
    'calls:updateIntegration',
    async ({ subdomain, data: { integrationId, doc } }) => {
      const details = JSON.parse(doc.data);
      const models = await generateModels(subdomain);

      const integration = await models.Integrations.findOne({
        inboxId: integrationId,
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
      } else if (details?.queues) {
        queues = details?.queues;
      } else {
        queues = [];
      }

      await models.Integrations.updateOne(
        { inboxId: integrationId },
        { $set: { ...details, queues: queues } },
      );

      const ENDPOINT_URL = getEnv({ name: 'ENDPOINT_URL' });
      const domain = getDomain(subdomain);
      if (ENDPOINT_URL) {
        // send domain to core endpoints

        try {
          await fetch(`${ENDPOINT_URL}/update-endpoint`, {
            method: 'POST',
            body: JSON.stringify({
              domain: domain,
              callQueues: queues,
              erxesApiId: integration._id,
              subdomain,
            }),
            headers: { 'Content-Type': 'application/json' },
          });
        } catch (e) {
          throw e;
        }
      }

      const updatedIntegration = await models.Integrations.findOne({
        inboxId: integrationId,
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
    'calls:removeIntegrations',
    async ({ subdomain, data: { integrationId } }) => {
      const models = await generateModels(subdomain);

      const integration = await models.Integrations.findOne({
        inboxId: integrationId,
      });

      if (!integration) {
        throw new Error('Integration not found');
      }

      const { _id, wsServer, queues } = integration;

      if (wsServer) {
        await models.Customers.deleteMany({
          inboxIntegrationId: integrationId,
        });

        await models.Integrations.deleteOne({ _id });
      }

      const ENDPOINT_URL = getEnv({ name: 'ENDPOINT_URL' });

      if (ENDPOINT_URL) {
        // send domain to core endpoints
        try {
          await fetch(`${ENDPOINT_URL}/remove-endpoint`, {
            method: 'POST',
            body: JSON.stringify({
              erxesApiId: integration._id,
            }),
            headers: {
              'Content-Type': 'application/json',
            },
          });
        } catch (e) {
          throw new Error(e.message);
        }
      }

      return {
        status: 'success',
      };
    },
  );

  consumeRPCQueue(
    'calls:integrationDetail',
    async (args: InterMessage): Promise<any> => {
      const { subdomain, data } = args;
      const { inboxId } = data;

      const models = await generateModels(subdomain);

      const callIntegration = await models.Integrations.findOne(
        { inboxId },
        'token',
      );

      return {
        status: 'success',
        data: { token: callIntegration?.token },
      };
    },
  );
  consumeQueue('calls:notification', async ({ subdomain, data }) => {
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
    'calls:getCallHistory',
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
