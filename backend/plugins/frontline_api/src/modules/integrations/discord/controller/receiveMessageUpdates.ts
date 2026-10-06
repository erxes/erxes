import { processDiscordMessageUpdate } from '@/integrations/discord/services/messages/updateOrder';
import type { IDiscordConversationMessage } from '@/integrations/discord/@types/conversationMessages';
import type { IModels } from '~/connectionResolvers';
import type {
  DiscordActivity,
  DiscordMessageDeleteEvent,
} from '@/integrations/discord/@types/activity';
import { isIgnorableActivity } from '@/integrations/discord/utils/messages/activity';
import { resolveDiscordMentions } from '@/integrations/discord/utils/messages/mentions';
import { rehostUpdatedImageAttachments } from '@/integrations/discord/utils/media/attachments';
import { debugDiscord } from '@/integrations/discord/debuggers';
import {
  resolveConversationByMessageId,
  updateInboxMessageExtra,
} from '@/integrations/discord/services/messages/inboxUpdates';

const applyDiscordMessageEdit = async ({
  models,
  subdomain,
  activity,
}: {
  models: IModels;
  subdomain: string;
  activity: DiscordActivity;
}) => {
  if (isIgnorableActivity(activity, { allowBotAuthor: true })) {
    return;
  }

  const resolved = await resolveConversationByMessageId(
    models,
    activity.messageId,
  );

  if (!resolved) {
    return;
  }

  const { message, conversation } = resolved;

  const editedAt = activity.raw?.edited_timestamp;
  const extraPatch: Record<string, unknown> = {};
  const rootPatch: Record<string, unknown> = {};
  const mirrorPatch: Partial<IDiscordConversationMessage> = {};

  if (activity.embeds?.length) {
    extraPatch.embeds = activity.embeds;
  }
  if (typeof activity.raw?.pinned === 'boolean') {
    extraPatch.discordPinned = activity.raw.pinned;
  }
  // Pin-only events can omit this field; preserve the existing edit marker.
  if (typeof editedAt === 'string') {
    extraPatch.discordEditedAt = editedAt;
    mirrorPatch.updatedAt = new Date();
  }

  if (Array.isArray(activity.raw?.attachments)) {
    const attachmentIds = activity.raw.attachments.map(({ id }) => id);
    const attachments = await rehostUpdatedImageAttachments(
      subdomain,
      activity.attachments,
      attachmentIds,
      message,
    );
    Object.assign(mirrorPatch, { attachments, attachmentIds });
    rootPatch.attachments = attachments;
  }

  if (
    typeof editedAt === 'string' &&
    typeof activity.raw?.content === 'string'
  ) {
    const displayContent = resolveDiscordMentions(
      activity.content,
      activity.mentions,
    );
    if (displayContent !== message.content) {
      mirrorPatch.content = displayContent;
      rootPatch.content = displayContent;
    }
  }

  if (Object.keys(mirrorPatch).length) {
    await models.DiscordConversationMessages.updateOne(
      { _id: message._id },
      { $set: mirrorPatch },
    );
  }
  if (!Object.keys(extraPatch).length && !Object.keys(rootPatch).length) {
    return;
  }
  await updateInboxMessageExtra(
    models,
    subdomain,
    activity.messageId,
    extraPatch,
    rootPatch,
  );

  debugDiscord(
    `Discord message ${activity.messageId} edited in conversation ${conversation.erxesApiId}`,
  );
};

export const receiveDiscordMessageEdit = (
  args: Parameters<typeof applyDiscordMessageEdit>[0],
): Promise<void> =>
  processDiscordMessageUpdate(args.subdomain, args.activity.messageId, () =>
    applyDiscordMessageEdit(args),
  );

export const receiveDiscordMessageDelete = async ({
  models,
  subdomain,
  event,
}: {
  models: IModels;
  subdomain: string;
  event: DiscordMessageDeleteEvent;
}) => {
  for (const messageId of event.messageIds) {
    await processDiscordMessageUpdate(subdomain, messageId, async () => {
      const resolved = await resolveConversationByMessageId(models, messageId);

      if (!resolved) {
        return;
      }

      const deletedAt = new Date();

      await models.DiscordConversationMessages.updateOne(
        { _id: resolved.message._id },
        { $set: { deletedAt } },
      );

      await updateInboxMessageExtra(
        models,
        subdomain,
        messageId,
        { discordDeletedAt: deletedAt.toISOString() },
        { content: '' },
      );

      debugDiscord(
        `Discord message ${messageId} deleted in conversation ${resolved.conversation.erxesApiId}`,
      );
    });
  }
};
