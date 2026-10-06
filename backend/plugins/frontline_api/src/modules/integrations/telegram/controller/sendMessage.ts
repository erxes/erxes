import { z } from 'zod';
import { stripHtml } from 'string-strip-html';
import validator from 'validator';
import type { IModels } from '~/connectionResolvers';
import type { ITelegramConversationMessage } from '@/integrations/telegram/@types/conversationMessages';
import {
  prepareTelegramReplyFiles,
  telegramReplyAttachmentSchema,
} from '../utils/replyAttachments';
import {
  sendTelegramMessage,
  sendTelegramAttachment,
  sendTelegramMediaGroup,
  sendTelegramPoll,
  telegramPollDraftSchema,
} from '@/integrations/telegram/client';
import {
  normalizeTelegramPoll,
  type TelegramInboxPoll,
  type TelegramMessageMetadata,
} from '../utils/content';
import type { TelegramMessage } from '../utils/message';
import { splitTelegramReplyText } from '../utils/replyText';

const telegramReplySchema = z.object({
  integrationId: z.string().min(1),
  conversationId: z.string().min(1),
  userId: z.string().min(1),
  content: z.string(),
  internal: z.boolean().nullish(),
  attachments: z.array(telegramReplyAttachmentSchema).max(10).nullish(),
  poll: telegramPollDraftSchema.nullish(),
  replyToMessageId: z
    .string()
    .regex(/^[1-9]\d*$/)
    .refine((id) => Number.isSafeInteger(Number(id)))
    .nullish(),
});

export interface ITelegramReplyResult {
  status: 'success';
  data: {
    conversationId: string;
    content: string;
    displayContent: string;
    extraData: {
      telegram: TelegramMessageMetadata & { messageIds: string[] };
      poll?: TelegramInboxPoll;
    };
  };
}

export const sendTelegramReply = async ({
  models,
  subdomain,
  payload,
}: {
  models: IModels;
  subdomain: string;
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

  const integration = await models.Integrations.findOne({
    _id: integrationId,
    kind: 'telegram-messenger',
  });
  if (!integration || integration.isActive === false)
    throw new Error(
      'This Telegram integration is disconnected or archived. Reconnect it before replying.',
    );

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
  const chatId = conversation.migratedToChatId ?? conversation.chatId;

  const replyTarget = replyToMessageId
    ? await models.TelegramConversationMessages.findOne({
        integrationId,
        conversationId: conversation._id,
        chatId,
        messageId: replyToMessageId,
      })
    : null;
  if (replyToMessageId && !replyTarget)
    throw new Error(
      'The quoted message must belong to this Telegram chat and topic. Messages from before a group upgrade cannot be quoted here.',
    );
  const quote: TelegramMessageMetadata['replyTo'] = replyTarget
    ? {
        messageId: replyTarget.messageId,
        chatId,
        senderName: replyTarget.senderName ?? '',
        content: replyTarget.content.slice(0, 500) || '[Attachment or poll]',
      }
    : undefined;
  const replyId = replyToMessageId ? Number(replyToMessageId) : undefined;

  // Strip editor markup before decoding its text. Decoding first turns a
  // literal &lt;b&gt; into a tag and silently removes part of the user's reply.
  const stripped = stripHtml(
    content.replace(/<br\s*\/?>(?:\n)?/gi, '\n').replace(/<\/(p|div)>/gi, '\n'),
    { skipHtmlDecoding: true },
  ).result;
  const text = validator.unescape(stripped.replace(/&nbsp;/g, '\u00a0')).trim();
  if (poll && (text || attachments?.length))
    throw new Error(
      'Send a Telegram poll separately from message text and attachments.',
    );
  if (!text && !attachments?.length && !poll)
    throw new Error('Enter a message or attach a file.');

  const textParts = splitTelegramReplyText(
    text,
    attachments?.length ? 1024 : 4096,
  );
  const caption = attachments?.length ? (textParts[0] ?? '') : '';
  const textMessages = attachments?.length ? textParts.slice(1) : textParts;

  // Prepare every file before the first provider write. A bad later file must
  // not leave an avoidable partial send behind.
  const files = await prepareTelegramReplyFiles(subdomain, attachments ?? []);
  const sentIds: string[] = [];
  let sentPoll: TelegramInboxPoll | undefined;
  const kind = (file: (typeof files)[number]) =>
    file.mediaType ?? (file.asPhoto ? 'photo' : 'document');
  const album =
    files.length > 1 &&
    (files.every((file) => ['photo', 'video'].includes(kind(file))) ||
      files.every((file) => kind(file) === 'document') ||
      files.every((file) => kind(file) === 'audio'));
  let albumMessages: TelegramMessage[] | undefined;
  for (
    let index = 0;
    index < Math.max(1, files.length + textMessages.length);
    index++
  ) {
    const file = files[index];
    let partText = textMessages[index - files.length] ?? '';
    if (file) partText = index === 0 ? caption : '';
    let sent: TelegramMessage;
    try {
      if (album && !albumMessages)
        albumMessages = await sendTelegramMediaGroup({
          token: bot.token,
          chatId,
          messageThreadId: conversation.messageThreadId,
          caption,
          files,
          replyToMessageId: replyId,
        });
      sent =
        albumMessages && file
          ? albumMessages[index]
          : poll
            ? await sendTelegramPoll({
                token: bot.token,
                chatId,
                messageThreadId: conversation.messageThreadId,
                poll,
                replyToMessageId: replyId,
              })
            : file
              ? await sendTelegramAttachment({
                  token: bot.token,
                  chatId,
                  messageThreadId: conversation.messageThreadId,
                  caption: partText,
                  replyToMessageId: index === 0 ? replyId : undefined,
                  ...file,
                })
              : await sendTelegramMessage(
                  bot.token,
                  chatId,
                  partText,
                  conversation.messageThreadId,
                  index === 0 ? replyId : undefined,
                );
    } catch (error: unknown) {
      const reason =
        error instanceof Error ? error.message : 'Telegram reply failed.';
      throw new Error(
        sentIds.length
          ? `${sentIds.length} message part(s) were accepted before the reply stopped. Check Telegram before retrying. ${reason}`
          : reason,
      );
    }
    if (sent.poll) sentPoll = normalizeTelegramPoll(sent.poll);
    sentIds.push(String(sent.message_id));
    const message: ITelegramConversationMessage = {
      integrationId,
      chatId,
      messageId: String(sent.message_id),
      conversationId: conversation._id,
      content: partText,
      createdAt: new Date(sent.date * 1000),
      userId,
      pollId: sent.poll?.id,
      poll: sent.poll ? normalizeTelegramPoll(sent.poll) : undefined,
      metadata: { replyTo: quote, mediaGroupId: sent.media_group_id },
      attachments: file
        ? [
            {
              name: file.name,
              type: file.type,
              url: file.url,
              size: file.bytes.length,
            },
          ]
        : [],
    };
    try {
      await models.TelegramConversationMessages.updateOne(
        {
          integrationId,
          chatId,
          messageId: message.messageId,
        },
        { $setOnInsert: message },
        { upsert: true, runValidators: true },
      );
    } catch {
      throw new Error(
        'Telegram accepted the message, but its local record could not be saved. Check the chat before trying again.',
      );
    }
  }
  return {
    status: 'success',
    data: {
      conversationId,
      content: text || sentPoll?.question || files[0]?.name || '',
      displayContent: content,
      extraData: {
        telegram: {
          messageIds: sentIds,
          ...(textParts.length > 1 ? { textChunked: true } : {}),
          replyTo: quote,
          contentType: poll ? 'poll' : files.length ? 'attachment' : 'text',
        },
        ...(sentPoll ? { poll: sentPoll } : {}),
      },
    },
  };
};
