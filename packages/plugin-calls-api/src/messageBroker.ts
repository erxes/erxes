import { getEnv, sendMessage } from '@erxes/api-utils/src/core';
import type {
  MessageArgs,
  MessageArgsOmitService,
} from '@erxes/api-utils/src/core';
import {
  checkForExistingIntegrations,
  generateToken,
  getDomain,
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

      const ENDPOINT_URL = getEnv({ name: 'ENDPOINT_URL' });
      const domain = getDomain(subdomain);

      const { integrationId, doc } = data;
      const models = generateModels(subdomain);
      try {
        const docData = JSON.parse(doc.data);
        console.log(docData, 'docData');
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
        console.log(checkedIntegration, 'checkedIntegration');
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

          if (ENDPOINT_URL && !['os', 'localhost'].includes(subdomain)) {
            // send domain to core endpoints
            try {
              const requestBody = {
                domain,
                erxesApiId: integration._id,
                subdomain,
              } as any;

              if (integration.srcTrunk) {
                requestBody.srcTrunk = integration.srcTrunk;
              }
              if (integration.dstTrunk) {
                requestBody.dstTrunk = integration.dstTrunk;
              }
              if (integration) {
                requestBody.callQueues = integration.queues;
              }
              await fetch(`${ENDPOINT_URL}/register-endpoint`, {
                method: 'POST',
                body: JSON.stringify({
                  ...requestBody,
                }),
                headers: { 'Content-Type': 'application/json' },
              });
            } catch (e) {
              await (
                await models
              ).Integrations.deleteOne({ _id: integration._id });
              throw e;
            }
          }
        }

        return { status: 'success' };
      } catch (error) {
        await (await models).Integrations.deleteOne({ inboxId: integrationId });
        return {
          status: 'error',
          errorMessage: error.keyPattern.wsServer
            ? 'Duplicate queue detected. Queues must be unique across integrations.'
            : error.keyPattern.srcTrunk
              ? 'Duplicate srcTrunk detected.'
              : error.keyPattern.dstTrunk
                ? 'Duplicate dstTrunk detected.'
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
        if (ENDPOINT_URL) {
          try {
            const requestBody = {
              domain,
              erxesApiId: integration._id,
              subdomain,
            } as any;

            if (details.srcTrunk) {
              requestBody.srcTrunk = details.srcTrunk;
            }
            if (details.dstTrunk) {
              requestBody.dstTrunk = details.dstTrunk;
            }
            if (updatedQueues) {
              requestBody.callQueues = updatedQueues;
            }
            console.log(requestBody, 'requestBody');
            await fetch(`${ENDPOINT_URL}/update-endpoint`, {
              method: 'POST',
              body: JSON.stringify(requestBody),
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
          errorMessage: error.keyPattern.wsServer
            ? 'Duplicate queue detected. Queues must be unique across integrations.'
            : error.keyPattern.srcTrunk
              ? 'Duplicate srcTrunk detected.'
              : error.keyPattern.dstTrunk
                ? 'Duplicate dstTrunk detected.'
                : `Error creating integration: ${error.message}`,
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
  consumeRPCQueue(
    'calls:getCallCdr',
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

        const history = await models.Cdrs.findOne({
          conversationId: erxesApiConversationId,
        });
        return {
          status: 'success',
          data: history,
        };
      } catch (error) {
        return {
          status: 'error',
          errorMessage: 'Error processing call cdr:' + error,
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
