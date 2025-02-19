import { getEnv, sendMessage } from '@erxes/api-utils/src/core';
import type {
  MessageArgs,
  MessageArgsOmitService,
} from '@erxes/api-utils/src/core';
import {
  checkForExistingIntegrations,
  generateToken,
  getDomain,
  sendToGrandStream,
  updateIntegrationQueueNames,
  updateIntegrationQueues,
} from './utils';
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
    'calls:createIntegration',
    async (args: InterMessage): Promise<any> => {
      const { subdomain, data } = args;
      const { integrationId, doc } = data;
      const models = generateModels(subdomain);
      try {
        const docData = JSON.parse(doc.data);

        const token = await generateToken(integrationId);

        const updateData = {
          inboxId: integrationId,
          token,
          ...docData,
        };
        const checkedIntegration = await checkForExistingIntegrations(
          subdomain,
          updateData,
          integrationId,
        );
        const { queues } = checkedIntegration;
        if (checkedIntegration) {
          const integration = await (
            await models
          ).Integrations.create({
            ...checkedIntegration,
          });
          try {
            await updateIntegrationQueueNames(
              subdomain,
              integration?.inboxId,
              integration.queues,
            );
          } catch (error) {
            console.error('Failed to update queue names:', error.message);
          }
        }
        return { status: 'success' };
      } catch (error) {
        await (await models).Integrations.deleteOne({ inboxId: integrationId });

        return {
          status: 'error',
          errorMessage:
            error.code === 11000
              ? 'Duplicate queue detected. Queues must be unique across integrations.'
              : `Error creating integration: ${error.message}`,
        };
      }
    },
  );

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
      try {
        const details = JSON.parse(doc.data);
        const models = await generateModels(subdomain);

        const integration = await models.Integrations.findOne({
          inboxId: integrationId,
        }).lean();
        if (!integration) {
          return { status: 'error', errorMessage: 'Integration not found.' };
        }

        // Update queues
        const updatedQueues = await updateIntegrationQueues(
          subdomain,
          integrationId,
          details,
        );

        // Update queue names this function role is detect which incoming call queue
        await updateIntegrationQueueNames(
          subdomain,
          integrationId,
          updatedQueues,
        );

        // Notify external endpoint if necessary
        const ENDPOINT_URL = getEnv({ name: 'ENDPOINT_URL' });
        const domain = getDomain(subdomain);
        if (ENDPOINT_URL && !['os', 'localhost'].includes(subdomain)) {
          try {
            await fetch(`${ENDPOINT_URL}/update-endpoint`, {
              method: 'POST',
              body: JSON.stringify({
                domain,
                callQueues: updatedQueues,
                erxesApiId: integration._id,
                subdomain,
              }),
              headers: { 'Content-Type': 'application/json' },
            });
          } catch (e) {
            console.error('Failed to update endpoint:', e.message);
          }
        }

        // Verify the update
        const updatedIntegration = await models.Integrations.findOne({
          inboxId: integrationId,
        });
        if (!updatedIntegration) {
          return {
            status: 'error',
            errorMessage: 'Integration not found after update.',
          };
        }

        return { status: 'success' };
      } catch (error) {
        console.error('Error in consumeRPCQueue:', error.message);
        return {
          status: 'error',
          errorMessage:
            error.code === 11000
              ? 'Duplicate queue detected. Queues must be unique across integrations.'
              : `Error updating integration: ${error.message}`,
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

      const { _id, wsServer } = integration;

      if (wsServer) {
        await models.Customers.deleteMany({
          inboxIntegrationId: integrationId,
        });

        await models.Integrations.deleteOne({ _id });
      }

      const ENDPOINT_URL = getEnv({ name: 'ENDPOINT_URL' });

      if (ENDPOINT_URL && !['os', 'localhost'].includes(subdomain)) {
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
