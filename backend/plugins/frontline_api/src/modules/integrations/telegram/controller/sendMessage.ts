import { z } from 'zod';
import { stripHtml } from 'string-strip-html';
import type { IModels } from '~/connectionResolvers';
import type { ITelegramConversationMessage } from '@/integrations/telegram/@types/conversationMessages';
import { sendTelegramMessage } from '@/integrations/telegram/client';

const telegramReplySchema = z.object({
  integrationId: z.string().min(1),
  conversationId: z.string().min(1),
  userId: z.string().min(1),
  content: z.string(),
  internal: z.boolean().nullish(),
  attachments: z.array(z.unknown()).nullish(),
  poll: z.unknown().optional(),
  replyToMessageId: z.string().nullish(),
});

export interface ITelegramReplyResult {
  status: 'success';
  data: {
    conversationId: string;
    content: string;
    displayContent: string;
  };
}

export const sendTelegramReply = async ({
  models,
  payload,
}: {
  models: IModels;
  payload: unknown;
}): Promise<ITelegramReplyResult> => {
  const parsed = telegramReplySchema.safeParse(payload);

  if (!parsed.success) {
    throw new Error('Invalid Telegram reply data');
  }

  const {
    integrationId,
    conversationId,
    userId,
    content,
    internal,
    attachments,
    poll,
    replyToMessageId,
  } = parsed.data;

  if (internal) {
    throw new Error('Internal notes must stay in the inbox');
  }

  if ((attachments?.length ?? 0) > 0 || poll != null || replyToMessageId) {
    throw new Error(
      'Telegram currently supports text messages without attachments, polls, or quoted replies',
    );
  }

  const bot = await models.TelegramBots.findOne({
    erxesApiId: integrationId,
  }).select('+token');

  if (!bot?.token) {
    throw new Error('Telegram bot not found for this integration');
  }

  const conversation = await models.TelegramConversations.findOne({
    integrationId,
    erxesApiId: conversationId,
  });

  if (!conversation) {
    throw new Error('Telegram conversation not found for this integration');
  }

  if (
    conversation.chatType !== 'private' ||
    conversation.messageThreadId !== 0
  ) {
    throw new Error('Only ordinary private Telegram chats are supported');
  }

  const text = stripHtml(content).result.trim();
  const sent = await sendTelegramMessage(bot.token, conversation.chatId, text);
  const messageContent = sent.text ?? text;

  const message: ITelegramConversationMessage = {
    integrationId,
    chatId: conversation.chatId,
    messageId: String(sent.message_id),
    conversationId: conversation._id,
    content: messageContent,
    createdAt: new Date(sent.date * 1000),
    userId,
  };

  try {
    await models.TelegramConversationMessages.create(message);
  } catch {
    throw new Error(
      'Telegram accepted this message, but its local record could not be saved. Check the chat before trying again.',
    );
  }

  return {
    status: 'success',
    data: {
      conversationId,
      content: messageContent,
      displayContent: content,
    },
  };
};
