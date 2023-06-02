import * as dotenv from 'dotenv';
import {
  ISendMessageArgs,
  sendMessage as sendCommonMessage
} from '@erxes/api-utils/src/core';
import { serviceDiscovery } from './configs';
import { Customers, Integrations, Messages } from './models';

dotenv.config();

let client;

export const initBroker = async cl => {
  client = cl;

  const { consumeRPCQueue } = client;

  consumeRPCQueue(
    'discord:createIntegration',
    async ({ data: { doc, integrationId } }) => {
      await Integrations.create({
        inboxId: integrationId,
        ...(doc || {})
      });

      return {
        status: 'success'
      };
    }
  );

  consumeRPCQueue(
    'discord:removeIntegration',
    async ({ data: { integrationId } }) => {
      await Messages.remove({ inboxIntegrationId: integrationId });
      await Customers.remove({ inboxIntegrationId: integrationId });
      await Integrations.remove({ inboxId: integrationId });

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
