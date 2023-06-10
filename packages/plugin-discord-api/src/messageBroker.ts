import * as dotenv from 'dotenv';
import {
  ISendMessageArgs,
  sendMessage as sendCommonMessage,
  sendMessage
} from '@erxes/api-utils/src/core';
import { serviceDiscovery } from './configs';
import { Customers, Integrations, Messages } from './models';
import { sendDiscordMessage } from './sendDiscordMessage';

dotenv.config();

let client;

const createDiscordIntegration = async ({ accountId, integrationId, data }) => {
  const discordChannelIds = JSON.parse(data).discordChannelIds;

  const createObject = {
    inboxId: integrationId,
    accountId,
    discordChannelIds
  };

  await Integrations.create(createObject);

  return { status: 'success' };
};

export const initBroker = async (cl, bot) => {
  client = cl;

  const { consumeRPCQueue } = client;

  consumeRPCQueue('discord:createIntegration', async ({ data }) => {
    const { doc, kind } = data;

    if (kind === 'discord') {
      return createDiscordIntegration(doc);
    }

    return {
      status: 'error',
      data: 'Wrong kind'
    };
  });

  consumeRPCQueue(
    'discord:removeIntegrations',
    async ({ data: { integrationId } }) => {
      await Messages.remove({ inboxIntegrationId: integrationId });
      await Customers.remove({ inboxIntegrationId: integrationId });
      await Integrations.remove({ inboxId: integrationId });

      return {
        status: 'success'
      };
    }
  );

  consumeRPCQueue(
    'discord:api_to_integrations',
    async ({ subdomain, data }) => {
      const { action, type } = data;

      let response: any = null;

      try {
        switch (type) {
          case 'discord':
          default:
            const messagePayload = JSON.parse(data.payload);
            return sendDiscordMessage(bot, messagePayload);
        }
      } catch (e) {
        response = {
          status: 'error',
          errorMessage: e.message
        };
      }
      return response;
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

export const sendCoreMessage = async (args: ISendMessageArgs) => {
  return sendMessage({
    serviceDiscovery,
    client,
    serviceName: 'core',
    ...args
  });
};

export const getConfig = async (
  code: string,
  subdomain: string,
  defaultValue?: string
) => {
  const configs = await sendCoreMessage({
    subdomain,
    action: 'getConfigs',
    data: {},
    isRPC: true,
    defaultValue: []
  });

  if (!configs[code]) {
    return defaultValue;
  }

  return configs[code];
};
