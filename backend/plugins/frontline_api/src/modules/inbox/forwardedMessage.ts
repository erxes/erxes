import strip from 'strip';
import type { IModels } from '~/connectionResolvers';
import {
  authorizeConversationAccess,
  type IAuthUser,
} from '@/inbox/conversationUtils';

const isRecord = (value: unknown): value is Record<string, unknown> =>
  value !== null && typeof value === 'object' && !Array.isArray(value);

/** Load forwarded content from a source message the user may access. */
export const resolveForwardedSnapshotForMessage = async (
  models: IModels,
  user: IAuthUser | null | undefined,
  extraInfo: unknown,
): Promise<Record<string, unknown> | undefined> => {
  const forwardInfo = isRecord(extraInfo) ? extraInfo : undefined;
  if (!forwardInfo?.forwardedFrom && !forwardInfo?.forwardedSnapshot) {
    return undefined;
  }

  const forwardedFrom = isRecord(forwardInfo.forwardedFrom)
    ? forwardInfo.forwardedFrom
    : undefined;
  const sourceConversationId = forwardedFrom?.conversationId;
  const sourceMessageId = forwardedFrom?.messageId;
  if (
    typeof sourceConversationId !== 'string' ||
    !sourceConversationId.trim() ||
    typeof sourceMessageId !== 'string' ||
    !sourceMessageId.trim() ||
    (forwardInfo.forwardedNote !== undefined &&
      typeof forwardInfo.forwardedNote !== 'string')
  ) {
    throw new Error('A forwarded message needs a valid source');
  }

  await authorizeConversationAccess(models, user, sourceConversationId);
  const sourceMessage = await models.ConversationMessages.findOne({
    _id: sourceMessageId,
    conversationId: sourceConversationId,
  });
  if (!sourceMessage) {
    throw new Error('Forwarded source message was not found');
  }

  const storedSnapshot = sourceMessage.extraData?.forwardedSnapshot;
  if (isRecord(storedSnapshot)) {
    return { ...storedSnapshot };
  }

  return {
    content: strip(sourceMessage.content || '') || undefined,
    attachments: sourceMessage.attachments,
    embeds: sourceMessage.extraData?.embeds,
    stickers: sourceMessage.extraData?.stickers,
    poll: sourceMessage.extraData?.poll,
    messageKind: sourceMessage.messageKind,
    providerData: sourceMessage.providerData,
    createdAt: sourceMessage.createdAt,
  };
};
