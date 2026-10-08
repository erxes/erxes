import { graphqlPubsub } from 'erxes-api-shared/utils';
import { z } from 'zod';
import type { IModels } from '~/connectionResolvers';
import type { ITelegramConversationMessageDocument } from '../@types/conversationMessages';
import { telegramTextToHtml } from '../utils/content';

// Match the owning conversation as well as provider identity: message IDs are
// only unique inside a Telegram chat, never globally.
export const syncTelegramInboxMessage = async (
  models: IModels,
  subdomain: string,
  conversationId: string,
  message: ITelegramConversationMessageDocument,
  fields: Record<string, unknown>,
  version?: { field: 'pollVersion' | 'reactionsVersion'; value: string },
): Promise<string> => {
  const selector = {
    conversationId,
    ...(message.userId
      ? { 'extraData.telegram.messageIds': message.messageId }
      : { _id: message.erxesApiId ?? `telegram-${message._id}` }),
  };
  let patch = fields;
  if (message.userId && ('content' in fields || 'attachments' in fields)) {
    const canonical = await models.ConversationMessages.findOne(selector);
    const ids = z
      .object({
        telegram: z.object({
          messageIds: z.array(z.string()),
          textChunked: z.boolean().optional(),
        }),
      })
      .safeParse(canonical?.extraData);
    if (ids.success && ids.data.telegram.messageIds.length > 1) {
      const parts = await models.TelegramConversationMessages.find({
        integrationId: message.integrationId,
        conversationId: message.conversationId,
        chatId: message.chatId,
        messageId: { $in: ids.data.telegram.messageIds },
      }).lean();
      const ordered = ids.data.telegram.messageIds.map((id) =>
        parts.find((part) => part.messageId === id),
      );
      patch = {
        content: ordered
          .map((part) => telegramTextToHtml(part?.content ?? ''))
          .filter(Boolean)
          .join(ids.data.telegram.textChunked ? '' : '<br>'),
        attachments: ordered.flatMap((part) => part?.attachments ?? []),
        'extraData.telegram.editedAt': message.metadata?.editedAt,
      };
    }
  }
  const updated = await models.ConversationMessages.findOneAndUpdate(
    {
      ...selector,
      ...(version
        ? {
            $or: [
              { [`extraData.telegram.${version.field}`]: null },
              {
                [`extraData.telegram.${version.field}`]: {
                  $lte: version.value,
                },
              },
            ],
          }
        : {}),
    },
    {
      $set: {
        ...patch,
        ...(version
          ? { [`extraData.telegram.${version.field}`]: version.value }
          : {}),
      },
    },
    { new: true },
  );
  if (!updated && version) {
    const existing = await models.ConversationMessages.findOne(selector);
    if (existing) return existing._id;
  }
  if (!updated)
    throw new Error(
      'Telegram inbox message is not linked yet; retry the webhook',
    );
  // Discord edits and polls use this same existing subscription. The client
  // replaces a matching ID in place without adding another bubble or count.
  await graphqlPubsub.publish(`conversationMessageInserted:${conversationId}`, {
    conversationMessageInserted: updated,
    subdomain,
  });
  return updated._id;
};
