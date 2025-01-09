import * as dotenv from 'dotenv';
import { sendMessage } from '@erxes/api-utils/src/core';
import type { MessageArgsOmitService } from '@erxes/api-utils/src/core';
import { consumeRPCQueue } from '@erxes/api-utils/src/messageBroker';

import { Customers, Integrations, Messages } from './models';

dotenv.config();

export const setupMessageConsumers = async () => {
  consumeRPCQueue(
    '{name}:createIntegration',
    async ({ data: { doc, integrationId } }) => {
      await Integrations.create({
        inboxId: integrationId,
        ...(doc || {}),
      });

      return {
        status: 'success',
      };
    }
  );

  consumeRPCQueue(
    '{name}:removeIntegration',
    async ({ data: { integrationId } }) => {
      await Messages.remove({ inboxIntegrationId: integrationId });
      await Customers.remove({ inboxIntegrationId: integrationId });
      await Integrations.remove({ inboxId: integrationId });

      return {
        status: 'success',
      };
    }
  );
};

export const sendCoreMessage = (args: MessageArgsOmitService) => {
  return sendMessage({
    serviceName: 'core',
    ...args,
  });
};

export const sendInboxMessage = (args: MessageArgsOmitService) => {
  return sendMessage({
    serviceName: 'inbox',
    ...args,
  });
};
