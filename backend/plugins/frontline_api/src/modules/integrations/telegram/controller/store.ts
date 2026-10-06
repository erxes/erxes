import { z } from 'zod';
import { sendTRPCMessage } from 'erxes-api-shared/utils';
import { randomUUID } from 'node:crypto';
import {
  getTelegramMessageContent,
  getTelegramMessageMetadata,
  getTelegramMessagePreview,
  getTelegramSenderName,
  getTelegramThreadId,
  telegramTextToHtml,
} from '../utils/content';
import { syncTelegramReactions } from './reactions';
import { syncTelegramInboxMessage } from './sync';
import { storeTelegramAttachment } from '../utils/attachments';
import {
  TelegramFileTooLargeError,
  TELEGRAM_FILE_TOO_LARGE_NOTICE,
} from '../utils/fileLimits';
import { pConversationClientMessageInserted } from '@/inbox/graphql/resolvers/mutations/widget';
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

const CONVERSATION_LINK_ATTEMPTS = 4;
const MESSAGE_LEASE_MS = 120_000;

/** Reuses a stable Core contact ID so webhook retries cannot duplicate contacts. */
export const createCoreCustomer = async (
  subdomain: string,
  integrationId: string,
  sender: NonNullable<TelegramMessage['from']>,
  customerId: string,
): Promise<string> => {
  /** Checks the public Core lookup before creating or recovering a contact. */
  const findExisting = async (): Promise<string | undefined> => {
    const found: unknown = await sendTRPCMessage({
      subdomain,
      pluginName: 'core',
      module: 'customers',
      action: 'findOne',
      method: 'query',
      input: { query: { _id: customerId } },
    });
    const parsed = inboxEntityResponseSchema.safeParse(found);
    return parsed.success ? parsed.data._id : undefined;
  };
  const existing = await findExisting();
  if (existing) return existing;
  // The public Core create contract accepts _id. A stable ID prevents a slow
  // first webhook and its retry from creating two contacts, including after a
  // crash between Core creation and the Telegram-to-Core link.
  const response = await receiveInboxMessage(subdomain, {
    action: 'get-create-update-customer',
    payload: JSON.stringify({
      _id: customerId,
      integrationId,
      firstName: sender.first_name,
      lastName: sender.last_name,
      isUser: true,
    }),
  });

  if (response.status !== 'success') {
    const recovered = await findExisting();
    if (recovered) return recovered;
    throw new Error(`Customer creation failed: ${response.errorMessage}`);
  }

  const customer = inboxEntityResponseSchema.safeParse(response.data);

  if (!customer.success) {
    throw new Error('Core did not return a valid customer ID');
  }

  return customer.data._id;
};

/** Upserts the tenant Telegram identity and converges concurrent deliveries. */
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

/** Links a provider identity to its Core contact without overwriting a concurrent winner. */
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

  const customer = result.customer;
  if (customer.erxesApiId) return customer;

  const erxesApiId = await createCoreCustomer(
    subdomain,
    integrationId,
    sender,
    `telegram-${customer._id}`,
  );

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

/** Finds or creates one conversation per integration, chat and forum topic. */
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
    messageThreadId: getTelegramThreadId(message),
  };
  const topicName =
    message.forum_topic_created?.name ?? message.forum_topic_edited?.name;
  const chatFields = {
    chatTitle: message.new_chat_title ?? message.chat.title,
    chatType: message.migrate_to_chat_id ? 'supergroup' : message.chat.type,
    ...(topicName !== undefined ? { topicName } : {}),
  };

  // A group upgrade changes the provider ID. Keep the original history when
  // possible, without merging/deleting a conversation already seen at the new ID.
  const existing =
    (await models.TelegramConversations.findOne(selector)) ??
    (await models.TelegramConversations.findOne({
      integrationId,
      migratedToChatId: selector.chatId,
      messageThreadId: selector.messageThreadId,
    }));
  if (existing) {
    const conversation = await models.TelegramConversations.findOneAndUpdate(
      { _id: existing._id },
      { $set: chatFields },
      { new: true, runValidators: true },
    );
    if (!conversation)
      throw new Error('Telegram conversation no longer exists');
    return { conversation, created: false };
  }

  let created = false;

  try {
    const result = await models.TelegramConversations.updateOne(
      selector,
      {
        $setOnInsert: {
          ...selector,
          ...chatFields,
          timestamp: new Date(message.date * 1000),
          content: getTelegramMessagePreview(
            getTelegramMessageContent(message),
          ),
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

/** Creates the canonical inbox conversation using the stable Telegram mapping ID. */
export const createInboxConversation = async (
  subdomain: string,
  conversation: ITelegramConversationDocument,
  customerId?: string,
): Promise<string> => {
  const response = await receiveInboxMessage(subdomain, {
    action: 'create-or-update-conversation',
    payload: JSON.stringify({
      conversationId: `telegram-${conversation._id}`,
      integrationId: conversation.integrationId,
      customerId: conversation.chatType === 'private' ? customerId : undefined,
      content: telegramTextToHtml(conversation.content),
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

/** Waits for an in-flight link, then safely recovers an unlinked conversation. */
export const getOrCreateConversation = async (
  models: IModels,
  subdomain: string,
  integrationId: string,
  message: TelegramMessage,
  customer?: ITelegramCustomerDocument,
): Promise<ITelegramConversationDocument> => {
  const customerId = customer?.erxesApiId;

  if (customer && !customerId) {
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

/** Deduplicates provider message IDs within their integration and chat. */
export const getOrCreateTelegramMessage = async (
  models: IModels,
  conversation: ITelegramConversationDocument,
  message: TelegramMessage,
  customerId?: string,
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
          senderName: getTelegramSenderName(message),
          metadata: getTelegramMessageMetadata(message),
          pollId: message.poll?.id,
          poll: getTelegramMessageContent(message).poll,
          content: getTelegramMessageContent(message)?.content ?? '',
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

/** Inserts a native inbox message and publishes through the existing inbox bridge. */
export const createInboxMessage = async (
  subdomain: string,
  inboxConversationId: string,
  message: ITelegramConversationMessageDocument,
  chatType = 'private',
): Promise<string> => {
  const response = await receiveInboxMessage(subdomain, {
    action: 'create-conversation-message',
    metaInfo: 'replaceContent',
    payload: JSON.stringify({
      _id: `telegram-${message._id}`,
      conversationId: inboxConversationId,
      content: telegramTextToHtml(message.content),
      extraData: {
        poll: message.poll,
        telegram: {
          ...message.metadata,
          chatType,
          senderName: message.senderName,
          messageId: message.messageId,
        },
      },
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

/** Leases message processing to store media, recover interrupted inserts, and apply ordered edits. */
export const getOrCreateMessage = async (
  models: IModels,
  subdomain: string,
  conversation: ITelegramConversationDocument,
  message: TelegramMessage,
  customer?: ITelegramCustomerDocument,
  updateId = 0,
): Promise<ITelegramConversationMessageDocument> => {
  const inboxConversationId = conversation.erxesApiId;
  if (!inboxConversationId || (customer && !customer.erxesApiId)) {
    throw new Error(
      'Telegram conversation and sender must be linked before storing a message',
    );
  }
  const { message: stored } = await getOrCreateTelegramMessage(
    models,
    conversation,
    message,
    customer?.erxesApiId,
  );
  const editDate = message.edit_date ?? 0;
  const isEdit = editDate > 0;
  const alreadyApplied =
    (stored.processedEditDate ?? 0) > editDate ||
    ((stored.processedEditDate ?? 0) === editDate &&
      (stored.processedUpdateId ?? 0) >= updateId);
  if ((stored.erxesApiId || stored.userId) && (!isEdit || alreadyApplied))
    return stored;

  const processingToken = randomUUID();
  let storedMessage =
    await models.TelegramConversationMessages.findOneAndUpdate(
      {
        _id: stored._id,
        ...(!isEdit ? { erxesApiId: null } : {}),
        $or: [
          { processingUntil: null },
          { processingUntil: { $lt: new Date() } },
        ],
      },
      {
        $set: {
          processingToken,
          processingUntil: new Date(Date.now() + MESSAGE_LEASE_MS),
        },
      },
      { new: true },
    );
  if (!storedMessage) {
    const current = await models.TelegramConversationMessages.getMessage({
      _id: stored._id,
    });
    if (current.erxesApiId && !isEdit) return current;
    throw new Error(
      'This Telegram message is still being processed; retry the webhook',
    );
  }

  const lease = { _id: stored._id, processingToken };
  let leaseLost = false;
  let renewal = Promise.resolve();
  const heartbeat = setInterval(() => {
    renewal = renewal
      .then(async () => {
        const renewed = await models.TelegramConversationMessages.updateOne(
          lease,
          {
            $set: { processingUntil: new Date(Date.now() + MESSAGE_LEASE_MS) },
          },
        );
        if (!renewed.matchedCount) leaseLost = true;
      })
      .catch(() => {
        leaseLost = true;
      });
  }, 30_000);
  heartbeat.unref();

  try {
    if (
      isEdit &&
      ((storedMessage.processedEditDate ?? 0) > editDate ||
        ((storedMessage.processedEditDate ?? 0) === editDate &&
          (storedMessage.processedUpdateId ?? 0) >= updateId))
    )
      return storedMessage;
    let inboxId = stored.erxesApiId ?? `telegram-${stored._id}`;
    const inboxMessage = await models.ConversationMessages.findOne({
      _id: inboxId,
      conversationId: inboxConversationId,
    });
    if (!inboxMessage || isEdit) {
      const mapped = getTelegramMessageContent(message);
      // An edited poll message may arrive after a newer standalone poll tally.
      // Preserve that tally while still applying the message's other edits.
      const poll =
        message.poll?.id === storedMessage.pollId &&
        (storedMessage.pollUpdateId ?? 0) > updateId &&
        (storedMessage.pollUpdateAt?.getTime() ?? 0) >
          Date.now() - 7 * 86400_000
          ? storedMessage.poll
          : mapped.poll;
      const sources = [
        mapped.attachment,
        ...(mapped.additionalAttachments ?? []),
      ].filter((source): source is NonNullable<typeof source> =>
        Boolean(source),
      );
      const sameFiles =
        JSON.stringify(sources.map((source) => source.fileId)) ===
        JSON.stringify(storedMessage.attachmentFileIds ?? []);
      const attachments = sameFiles ? (storedMessage.attachments ?? []) : [];
      let content = mapped.content;
      if (sources.length && !sameFiles) {
        const bot = await models.TelegramBots.findOne({
          erxesApiId: conversation.integrationId,
        }).select('+token');
        if (!bot?.token) throw new Error('Telegram bot is no longer connected');
        for (const source of sources) {
          try {
            attachments.push(
              await storeTelegramAttachment({
                subdomain,
                token: bot.token,
                ...source,
              }),
            );
          } catch (error: unknown) {
            if (!(error instanceof TelegramFileTooLargeError)) throw error;
            content = [content, TELEGRAM_FILE_TOO_LARGE_NOTICE]
              .filter(Boolean)
              .join('\n');
          }
        }
      } else if (
        sameFiles &&
        storedMessage.content.includes(TELEGRAM_FILE_TOO_LARGE_NOTICE)
      ) {
        content = [content, TELEGRAM_FILE_TOO_LARGE_NOTICE]
          .filter(Boolean)
          .join('\n');
      }
      const updated =
        await models.TelegramConversationMessages.findOneAndUpdate(
          lease,
          {
            $set: {
              content,
              attachments,
              attachmentFileIds: sources.map((source) => source.fileId),
              metadata: getTelegramMessageMetadata(message),
              ...(poll ? { pollId: message.poll?.id, poll } : {}),
              ...(isEdit ? { updatedAt: new Date(editDate * 1000) } : {}),
            },
            ...(!poll ? { $unset: { pollId: '', poll: '' } } : {}),
          },
          { new: true, runValidators: true },
        );
      if (!updated || leaseLost)
        throw new Error('Telegram message processing lease was lost');
      storedMessage = updated;
      if (inboxMessage || stored.userId) {
        inboxId = await syncTelegramInboxMessage(
          models,
          subdomain,
          inboxConversationId,
          storedMessage,
          {
            content: telegramTextToHtml(content),
            attachments,
            ...Object.fromEntries(
              Object.entries(getTelegramMessageMetadata(message)).map(
                ([key, value]) => [`extraData.telegram.${key}`, value ?? null],
              ),
            ),
            'extraData.poll': poll ?? null,
          },
        );
      } else {
        if (!content) {
          // Like Discord, keep the preview separate from a media/poll bubble.
          // Set it before the inbox bridge publishes its list update.
          await models.Conversations.updateConversation(inboxConversationId, {
            content: telegramTextToHtml(getTelegramMessagePreview(mapped)),
          });
        }
        await createInboxMessage(
          subdomain,
          inboxConversationId,
          storedMessage,
          conversation.chatType,
        );
      }
    } else {
      // Recover a crash after the canonical insert but before our link was saved.
      await models.Conversations.updateConversation(inboxConversationId, {
        status: 'open',
        readUserIds: [],
        content: telegramTextToHtml(
          storedMessage.content ||
            getTelegramMessagePreview(getTelegramMessageContent(message)),
        ),
        updatedAt: storedMessage.createdAt,
      });
      await pConversationClientMessageInserted(subdomain, inboxMessage);
    }
    if (
      await models.TelegramReactions.exists({
        integrationId: stored.integrationId,
        chatId: stored.chatId,
        messageId: stored.messageId,
      })
    )
      await syncTelegramReactions(
        models,
        subdomain,
        inboxConversationId,
        storedMessage,
      );
    const linked = await models.TelegramConversationMessages.findOneAndUpdate(
      lease,
      {
        $set: {
          erxesApiId: inboxId,
          processedEditDate: editDate,
          processedUpdateId: updateId,
        },
      },
      { new: true, runValidators: true },
    );
    if (!linked) throw new Error('Telegram message processing lease was lost');
    return linked;
  } finally {
    clearInterval(heartbeat);
    await renewal;
    await models.TelegramConversationMessages.updateOne(lease, {
      $unset: { processingToken: '', processingUntil: '' },
    });
  }
};
