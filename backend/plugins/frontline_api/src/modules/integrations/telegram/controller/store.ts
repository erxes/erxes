import { z } from 'zod';
import { receiveInboxMessage } from '@/inbox/receiveMessage';
import { TelegramMessage } from '@/integrations/telegram/utils/message';
import { mongo } from 'mongoose';
import { IModels } from '~/connectionResolvers';
import { ITelegramCustomerDocument } from '@/integrations/telegram/@types/customers';
import { ITelegramConversationDocument } from '@/integrations/telegram/@types/conversations';
import { ITelegramConversationMessageDocument } from '@/integrations/telegram/@types/conversationMessages';

const inboxEntityResponseSchema = z.object({
  _id: z.string().min(1),
});

const CUSTOMER_LINK_ATTEMPTS = 4;
const CONVERSATION_LINK_ATTEMPTS = 4;
const MESSAGE_LINK_ATTEMPTS = 4;

export const createCoreCustomer = async (
  subdomain: string,
  integrationId: string,
  sender: NonNullable<TelegramMessage['from']>,
): Promise<string> => {
  const response = await receiveInboxMessage(subdomain, {
    action: 'get-create-update-customer',
    payload: JSON.stringify({
      integrationId,
      firstName: sender.first_name,
      lastName: sender.last_name,
      isUser: true,
    }),
  });

  if (response.status !== 'success') {
    throw new Error(`Customer creation failed: ${response.errorMessage}`);
  }

  const customer = inboxEntityResponseSchema.safeParse(response.data);

  if (!customer.success) {
    throw new Error('Core did not return a valid customer ID');
  }

  return customer.data._id;
};

export const getOrCreateTelegramCustomer = async (
  models: IModels,
  integrationId: string,
  sender: NonNullable<TelegramMessage['from']>,
): Promise<{
  customer: ITelegramCustomerDocument;
  created: boolean;
}> => {
  const userId = String(sender.id);
  let created = false;

  try {
    const result = await models.TelegramCustomers.updateOne(
      { userId },
      {
        $setOnInsert: {
          userId,
          integrationId,
          firstName: sender.first_name,
          lastName: sender.last_name,
          username: sender.username,
        },
      },
      {
        upsert: true,
        runValidators: true,
        setDefaultsOnInsert: true,
      },
    );

    created = result.upsertedCount === 1;
  } catch (error: unknown) {
    if (
      !(
        error instanceof mongo.MongoServerError &&
        error.code === 11000 &&
        error.keyPattern?.userId === 1
      )
    ) {
      throw error;
    }
  }

  return {
    customer: await models.TelegramCustomers.getCustomer({ userId }),
    created,
  };
};

export const getOrCreateCustomer = async (
  models: IModels,
  subdomain: string,
  integrationId: string,
  sender: NonNullable<TelegramMessage['from']>,
): Promise<ITelegramCustomerDocument> => {
  const result = await getOrCreateTelegramCustomer(
    models,
    integrationId,
    sender,
  );

  let customer = result.customer;

  if (!result.created) {
    for (let attempt = 1; attempt <= CUSTOMER_LINK_ATTEMPTS; attempt++) {
      if (customer.erxesApiId) {
        return customer;
      }

      await new Promise<void>((resolve) => {
        setTimeout(resolve, 250 * attempt);
      });

      customer = await models.TelegramCustomers.getCustomer({
        _id: customer._id,
      });
    }
  }

  if (customer.erxesApiId) {
    return customer;
  }

  const erxesApiId = await createCoreCustomer(subdomain, integrationId, sender);

  const linkedCustomer = await models.TelegramCustomers.findOneAndUpdate(
    { _id: customer._id, erxesApiId: null },
    { $set: { erxesApiId } },
    { new: true, runValidators: true },
  );

  if (linkedCustomer) {
    return linkedCustomer;
  }

  const currentCustomer = await models.TelegramCustomers.getCustomer({
    _id: customer._id,
  });

  if (!currentCustomer.erxesApiId) {
    throw new Error('Telegram customer could not be linked to a Core contact');
  }

  return currentCustomer;
};

export const getOrCreateTelegramConversation = async (
  models: IModels,
  integrationId: string,
  message: TelegramMessage,
): Promise<{
  conversation: ITelegramConversationDocument;
  created: boolean;
}> => {
  const selector = {
    integrationId,
    chatId: String(message.chat.id),
    messageThreadId: message.message_thread_id ?? 0,
  };

  let created = false;

  try {
    const result = await models.TelegramConversations.updateOne(
      selector,
      {
        $setOnInsert: {
          ...selector,
          chatType: message.chat.type,
          chatTitle: message.chat.title,
          timestamp: new Date(message.date * 1000),
          content: message.text ?? '',
        },
      },
      {
        upsert: true,
        runValidators: true,
        setDefaultsOnInsert: true,
      },
    );

    created = result.upsertedCount === 1;
  } catch (error: unknown) {
    if (
      !(
        error instanceof mongo.MongoServerError &&
        error.code === 11000 &&
        error.keyPattern?.integrationId === 1 &&
        error.keyPattern?.chatId === 1 &&
        error.keyPattern?.messageThreadId === 1
      )
    ) {
      throw error;
    }
  }

  return {
    conversation: await models.TelegramConversations.getConversation(selector),
    created,
  };
};

export const createInboxConversation = async (
  subdomain: string,
  conversation: ITelegramConversationDocument,
  customerId: string,
): Promise<string> => {
  const response = await receiveInboxMessage(subdomain, {
    action: 'create-or-update-conversation',
    payload: JSON.stringify({
      integrationId: conversation.integrationId,
      customerId,
      content: conversation.content,
      createdAt: conversation.timestamp,
    }),
  });

  if (response.status !== 'success') {
    throw new Error(`Conversation creation failed: ${response.errorMessage}`);
  }

  const inboxConversation = inboxEntityResponseSchema.safeParse(response.data);

  if (!inboxConversation.success) {
    throw new Error('Inbox did not return a valid conversation ID');
  }

  return inboxConversation.data._id;
};

export const getOrCreateConversation = async (
  models: IModels,
  subdomain: string,
  integrationId: string,
  message: TelegramMessage,
  customer: ITelegramCustomerDocument,
): Promise<ITelegramConversationDocument> => {
  const customerId = customer.erxesApiId;

  if (!customerId) {
    throw new Error('Telegram customer must be linked to a Core contact');
  }

  const result = await getOrCreateTelegramConversation(
    models,
    integrationId,
    message,
  );

  let conversation = result.conversation;

  if (!result.created) {
    for (let attempt = 1; attempt <= CONVERSATION_LINK_ATTEMPTS; attempt++) {
      if (conversation.erxesApiId) {
        return conversation;
      }

      await new Promise<void>((resolve) => {
        setTimeout(resolve, 250 * attempt);
      });

      conversation = await models.TelegramConversations.getConversation({
        _id: conversation._id,
      });
    }
  }

  if (conversation.erxesApiId) {
    return conversation;
  }

  const erxesApiId = await createInboxConversation(
    subdomain,
    conversation,
    customerId,
  );

  const linkedConversation =
    await models.TelegramConversations.findOneAndUpdate(
      { _id: conversation._id, erxesApiId: null },
      { $set: { erxesApiId } },
      { new: true, runValidators: true },
    );

  if (linkedConversation) {
    return linkedConversation;
  }

  const currentConversation =
    await models.TelegramConversations.getConversation({
      _id: conversation._id,
    });

  if (!currentConversation.erxesApiId) {
    throw new Error(
      'Telegram conversation could not be linked to an inbox conversation',
    );
  }
  return currentConversation;
};

export const getOrCreateTelegramMessage = async (
  models: IModels,
  conversation: ITelegramConversationDocument,
  message: TelegramMessage,
  customerId: string,
): Promise<{
  message: ITelegramConversationMessageDocument;
  created: boolean;
}> => {
  const selector = {
    integrationId: conversation.integrationId,
    chatId: String(message.chat.id),
    messageId: String(message.message_id),
  };

  let created = false;

  try {
    const result = await models.TelegramConversationMessages.updateOne(
      selector,
      {
        $setOnInsert: {
          ...selector,
          conversationId: conversation._id,
          customerId,
          content: message.text ?? '',
          createdAt: new Date(message.date * 1000),
        },
      },
      {
        upsert: true,
        runValidators: true,
        setDefaultsOnInsert: true,
      },
    );

    created = result.upsertedCount === 1;
  } catch (error: unknown) {
    if (
      !(
        error instanceof mongo.MongoServerError &&
        error.code === 11000 &&
        error.keyPattern?.integrationId === 1 &&
        error.keyPattern?.chatId === 1 &&
        error.keyPattern?.messageId === 1
      )
    ) {
      throw error;
    }
  }

  return {
    message: await models.TelegramConversationMessages.getMessage(selector),
    created,
  };
};

export const createInboxMessage = async (
  subdomain: string,
  inboxConversationId: string,
  message: ITelegramConversationMessageDocument,
): Promise<string> => {
  const response = await receiveInboxMessage(subdomain, {
    action: 'create-conversation-message',
    metaInfo: 'replaceContent',
    payload: JSON.stringify({
      conversationId: inboxConversationId,
      content: message.content,
      customerId: message.customerId,
      createdAt: message.createdAt,
      attachments: message.attachments,
    }),
  });

  if (response.status !== 'success') {
    throw new Error(`Message creation failed: ${response.errorMessage}`);
  }

  const inboxMessage = inboxEntityResponseSchema.safeParse(response.data);

  if (!inboxMessage.success) {
    throw new Error('Inbox did not return a valid message ID');
  }

  return inboxMessage.data._id;
};

export const getOrCreateMessage = async (
  models: IModels,
  subdomain: string,
  conversation: ITelegramConversationDocument,
  message: TelegramMessage,
  customer: ITelegramCustomerDocument,
): Promise<ITelegramConversationMessageDocument> => {
  const inboxConversationId = conversation.erxesApiId;
  const customerId = customer.erxesApiId;

  if (!inboxConversationId || !customerId) {
    throw new Error(
      'Customer and conversation must be linked before storing a Telegram message',
    );
  }

  const result = await getOrCreateTelegramMessage(
    models,
    conversation,
    message,
    customerId,
  );

  let storedMessage = result.message;

  if (!result.created) {
    for (let attempt = 1; attempt <= MESSAGE_LINK_ATTEMPTS; attempt++) {
      if (storedMessage.erxesApiId) {
        return storedMessage;
      }

      await new Promise<void>((resolve) => {
        setTimeout(resolve, 250 * attempt);
      });

      storedMessage = await models.TelegramConversationMessages.getMessage({
        _id: storedMessage._id,
      });
    }
  }
  if (storedMessage.erxesApiId) {
    return storedMessage;
  }

  const erxesApiId = await createInboxMessage(
    subdomain,
    inboxConversationId,
    storedMessage,
  );

  const linkedMessage =
    await models.TelegramConversationMessages.findOneAndUpdate(
      {
        _id: storedMessage._id,
        erxesApiId: null,
      },
      { $set: { erxesApiId } },
      { new: true, runValidators: true },
    );

  if (linkedMessage) {
    return linkedMessage;
  }

  const currentMessage = await models.TelegramConversationMessages.getMessage({
    _id: storedMessage._id,
  });

  if (!currentMessage.erxesApiId) {
    throw new Error('Telegram message could not be linked to an inbox message');
  }
  return currentMessage;
};
