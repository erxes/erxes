import { sendMessage } from '@erxes/api-utils/src/core';
import type {
  MessageArgs,
  MessageArgsOmitService,
} from '@erxes/api-utils/src/core';
import { generateToken } from './utils';
import { generateModels } from './connectionResolver';
import {
  consumeQueue,
  consumeRPCQueue,
} from '@erxes/api-utils/src/messageBroker';
import type {
  InterMessage,
  RPResult,
} from '@erxes/api-utils/src/messageBroker';

export const initBroker = async () => {
  consumeRPCQueue(
    'calls:createIntegration',
    async (args: InterMessage): Promise<any> => {
      const { subdomain, data } = args;
      const { integrationId, doc } = data;
      const models = generateModels(subdomain);
      const docData = JSON.parse(doc.data);

      const token = await generateToken(integrationId);

      await (
        await models
      ).Integrations.create({
        inboxId: integrationId,
        token,
        ...docData,
      });

      return {
        status: 'success',
      };
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

      await models.Integrations.updateOne(
        { inboxId: integrationId },
        { $set: details },
      );

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

      await models.Integrations.deleteOne({ inboxId: integrationId });

      return {
        status: 'success',
      };
    },
  );

  consumeRPCQueue(
    'viber:integrationDetail',
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
