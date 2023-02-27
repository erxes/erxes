import * as dotenv from 'dotenv';
import {
  ISendMessageArgs,
  sendMessage as sendCommonMessage
} from '@erxes/api-utils/src/core';
import { serviceDiscovery } from './configs';
// import { Customers, Integrations, Messages } from './models';
import { generateModels } from './connectionResolver';
import {
  zaloCreateIntegration,
  removeIntegration
  // repairIntegrations
} from './helpers';

dotenv.config();

let client;

export const initBroker = async cl => {
  client = cl;

  const { consumeRPCQueue } = client;

  consumeRPCQueue(
    'zalo:createIntegration',
    async ({ subdomain, data: { doc, kind } }) => {
      const models = await generateModels(subdomain);

      if (kind === 'zalo') {
        return zaloCreateIntegration(models, doc);
      }

      return {
        status: 'error',
        data: 'Wrong kind'
      };
    }
    // async ({ data: { doc, integrationId } }) => {

    //   await Integrations.create({
    //     inboxId: integrationId,
    //     ...(doc || {})
    //   });

    //   return {
    //     status: 'success'
    //   };
    // }
  );

  consumeRPCQueue(
    'zalo:removeIntegration',
    async ({ subdomain, data: { integrationId } }) => {
      const models = await generateModels(subdomain);
      await removeIntegration(models, integrationId);
      // await Messages.remove({ inboxIntegrationId: integrationId });
      // await Customers.remove({ inboxIntegrationId: integrationId });
      // await Integrations.remove({ inboxId: integrationId });

      return {
        status: 'success'
      };
    }
  );

  consumeRPCQueue(
    'zalo:conversationMessages.find',
    async ({ subdomain, data }) => {
      const models = await generateModels(subdomain);

      return {
        status: 'success',
        data: /* await models.ConversationMessages.find(data).lean() */ []
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
    timeout: 50000,
    ...args
  });
};
