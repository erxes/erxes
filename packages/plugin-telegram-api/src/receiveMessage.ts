import { Message } from 'telegraf/typings/core/types/typegram';
import { Chats, Customers, Integrations, Messages } from './models';
import { sendContactsMessage, sendInboxMessage } from './messageBroker';
import { Context } from 'telegraf';

const getOrCreateCustomer = async (
  message: Message.TextMessage,
  integration
) => {
  const from = message.from?.id;

  const prev = await Customers.findOne({ telegramId: from });

  let customerId;

  if (prev) {
    return prev.contactsId;
  }

  const customer = await sendContactsMessage({
    subdomain: 'os',
    action: 'customers.findOne',
    data: {
      telegramId: from
    },
    isRPC: true
  });

  if (customer) {
    customerId = customer._id;
  } else {
    const apiCustomerResponse = await sendContactsMessage({
      subdomain: 'os',
      action: 'customers.createCustomer',
      data: {
        firstName: message.from?.first_name,
        lastName: message.from?.last_name,
        telegramId: from
      },
      isRPC: true
    });

    customerId = apiCustomerResponse._id;
  }

  await Customers.create({
    inboxIntegrationId: integration._id,
    contactsId: customerId,
    telegramId: from
  });

  return customerId;
};

export const receiveMessage = (accountId: string) => async (ctx: Context) => {
  // @ts-ignore
  const message = ctx.update.message as Message.TextMessage;

  // Don't listen for bot messages
  if (message.from?.is_bot) return;

  // Ignore private messages
  if (message.chat.type === 'private') return;

  const foundMessage = await Messages.findOne({
    messageId: message.message_id,
    chatId: message.chat.id
  });

  if (foundMessage) {
    return;
  }

  const chat = await Chats.findOne({ telegramId: message.chat.id });

  const integration = await Integrations.findOne({
    telegramChatId: chat._id,
    accountId: accountId
  });
  if (!integration) {
    return;
  }

  const customerId = await getOrCreateCustomer(message, integration);

  let conversationId;

  const relatedMessage = await Messages.findOne({
    chatId: message.chat.id
  });

  conversationId = relatedMessage?.inboxConversationId;
  const conversation = await sendInboxMessage({
    subdomain: 'os',
    action: 'integrations.receive',
    data: {
      action: 'create-or-update-conversation',
      payload: JSON.stringify({
        integrationId: integration.inboxIntegrationId,
        conversationId,
        customerId,
        createdAt: message.date,
        content: message.text
      })
    },
    isRPC: true
  });

  conversationId = conversation?._id;

  await sendInboxMessage({
    subdomain: 'os',
    action: 'integrations.receive',
    data: {
      action: 'create-conversation-message',
      payload: JSON.stringify({
        integrationId: integration.inboxIntegrationId,
        customerId,
        conversationId,
        createdAt: message.date,
        content: message.text
      })
    }
  });

  await Messages.create({
    inboxIntegrationId: integration.inboxIntegrationId,
    inboxConversationId: conversationId,
    createdAt: message.date,
    messageId: message.message_id,
    chatId: message.chat.id,
    subject: message.text,
    body: message.text,
    from: message.from && {
      address: message.from.id,
      name: `${message.from.first_name} ${message.from.last_name}`
    }
  });
};
