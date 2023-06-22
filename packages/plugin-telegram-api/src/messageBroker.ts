import * as dotenv from 'dotenv';
import * as strip from 'strip';
import {
  ISendMessageArgs,
  sendMessage as sendCommonMessage
} from '@erxes/api-utils/src/core';
import { serviceDiscovery } from './configs';
import { Accounts, Chats, Customers, Integrations, Messages } from './models';
import { Telegraf } from 'telegraf';

dotenv.config();

let client;

export const initBroker = async cl => {
  client = cl;

  const { consumeRPCQueue } = client;

  consumeRPCQueue('telegram:createIntegration', async ({ data }) => {
    const { doc, integrationId } = data;

    const customData = JSON.parse(doc.data);
    await Integrations.create({
      inboxIntegrationId: integrationId,
      ...(doc || {}),
      ...customData
    });

    return {
      status: 'success'
    };
  });

  consumeRPCQueue(
    'telegram:removeIntegrations',
    async ({ data: { integrationId } }) => {
      await Messages.remove({ inboxIntegrationId: integrationId });
      await Customers.remove({ inboxIntegrationId: integrationId });
      await Integrations.remove({ inboxIntegrationId: integrationId });

      return {
        status: 'success'
      };
    }
  );

  consumeRPCQueue('telegram:api_to_integrations', async ({ data }) => {
    const { action, payload } = data;
    const doc = JSON.parse(payload || '{}');

    if (!doc.internal) {
      const { integrationId, conversationId, content } = doc;

      const integration = await Integrations.findOne({
        inboxIntegrationId: integrationId
      });

      if (!integration) {
        return { status: 'error', data: 'Integration not found' };
      }

      const account = await Accounts.findOne({ _id: integration.accountId });

      if (!account) {
        return { status: 'error', data: 'Telegram account not found' };
      }

      const chat = await Chats.findOne({ _id: integration.telegramChatId });

      let strippedContent = strip(content);
      strippedContent = strippedContent.replace(/&amp;/g, '&');

      const client = new Telegraf(account.token);
      const response = await client.telegram.sendMessage(
        chat.telegramId,
        strippedContent
      );

      const localMessage = await Messages.create({
        ...doc,
        inboxIntegrationId: integrationId,
        inboxConversationId: conversationId,
        messageId: response.message_id,
        subject: strippedContent,
        body: strippedContent,
        from: {
          address: response.from?.id,
          name: `${response.from?.first_name} ${response.from?.last_name}`
        },
        chatId: response.chat.id
      });

      return {
        status: 'success',
        data: { ...localMessage.toObject(), conversationId }
      };
    }
  });
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
