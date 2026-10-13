import { sendAutomationTrigger } from 'erxes-api-shared/core-modules';
import type { IModels } from '~/connectionResolvers';
import type { IDiscordBotDocument } from '@/integrations/discord/@types/bot';
import type { IDiscordCustomerDocument } from '@/integrations/discord/@types/customers';
import type { IDiscordConversationDocument } from '@/integrations/discord/@types/conversations';
import type {
  DiscordActivity,
  DiscordAttachment,
} from '@/integrations/discord/@types/activity';
import { getErrorMessage } from '@/integrations/discord/utils/request';
import { DISCORD_MESSAGE_TRIGGER_TYPE } from '@/integrations/discord/constants';
import type { TDiscordTriggerTarget } from '@/integrations/discord/meta/automation/types';
import { debugDiscord } from '@/integrations/discord/debuggers';
import { receiveInboxMessage } from '@/inbox/receiveMessage';
import { publishDiscordMessage } from '@/integrations/discord/services/messages/events';

/**
 * Persists the mirror message row, syncs it into the inbox conversation
 * (store + realtime publish), and enrolls automations listening on inbound
 * Discord messages (AI Agent etc.) — skipped during history backfill so
 * replayed messages don't re-trigger them. The duplicate catch is the hard
 * idempotency guard against the live-dispatch race (the caller's earlier
 * existence check is a best-effort short-circuit, not a lock).
 *
 * Note: the "<bot> is typing…" indicator is intentionally NOT started here.
 * Starting it on every inbound message lights up channels/messages that no
 * automation ever answers. Instead it's started from the trigger match
 * (checkCustomTrigger), so it only shows when an automation actually matches
 * and is composing a reply — mirroring Facebook's behavior.
 */
export const persistAndDispatchMessage = async ({
  models,
  subdomain,
  bot,
  activity,
  conversation,
  customer,
  displayContent,
  storedAttachments,
  extraData,
  timestamp,
  skipAutomation,
}: {
  models: IModels;
  subdomain: string;
  bot: IDiscordBotDocument;
  activity: DiscordActivity;
  conversation: IDiscordConversationDocument;
  customer: IDiscordCustomerDocument;
  displayContent: string;
  storedAttachments: DiscordAttachment[];
  extraData: Record<string, unknown>;
  timestamp: Date;
  skipAutomation: boolean;
}) => {
  const { channelId, author, content, messageId } = activity;

  try {
    await models.DiscordConversationMessages.create({
      conversationId: conversation._id,
      messageId,
      createdAt: timestamp,
      content: displayContent,
      customerId: customer.erxesApiId,
      attachments: storedAttachments,
      attachmentIds: (activity.raw.attachments || []).map(({ id }) => id),
      replyTo: activity.replyTo,
    });

    // Persist the message into the inbox message store (so the conversation
    // detail renders it) AND publish the real-time event. The
    // `create-conversation-message` action does both; the publish-only
    // `pConversationClientMessageInserted` left the detail thread empty.
    let messageKind: string | undefined;
    if (activity.voiceMessage) messageKind = 'voice';
    else if (activity.stickers?.length) messageKind = 'sticker';
    else if (activity.forwardedSnapshot) messageKind = 'forwarded';
    await receiveInboxMessage(subdomain, {
      action: 'create-conversation-message',
      metaInfo: 'replaceContent',
      payload: JSON.stringify({
        conversationId: conversation.erxesApiId,
        content: displayContent || '',
        customerId: customer.erxesApiId,
        createdAt: timestamp,
        attachments: storedAttachments,
        extraData,
        providerData: { messageId },
        messageKind,
        replyTo: activity.replyTo,
        deliveryStatus: 'delivered',
      }),
    });

    debugDiscord(
      `Stored Discord message ${messageId} in conversation ${conversation.erxesApiId}`,
    );

    if (skipAutomation) {
      return;
    }

    const target: TDiscordTriggerTarget = {
      _id: messageId,
      content: content || '',
      conversationId: conversation.erxesApiId,
      customerId: customer.erxesApiId,
      channelId,
      guildId: activity.guildId,
      authorId: author.id,
      botId: bot._id,
      createdAt: timestamp,
    };

    sendAutomationTrigger(
      subdomain,
      {
        type: DISCORD_MESSAGE_TRIGGER_TYPE,
        targets: [target],
      },
      { transport: 'trpc' },
    );
  } catch (e) {
    throw new Error(
      getErrorMessage(e).includes('duplicate')
        ? 'Concurrent request: message duplication'
        : getErrorMessage(e),
    );
  }
};

/** Update missing reply context on a previously stored Discord message. */
export const skipExistingDiscordMessage = async ({
  models,
  subdomain,
  activity,
  conversationId,
}: {
  models: IModels;
  activity: DiscordActivity;
  conversationId?: string;
  subdomain: string;
}) => {
  const existingMessage = await models.DiscordConversationMessages.findOne({
    messageId: { $eq: activity.messageId },
  });
  if (!existingMessage) return false;
  if (activity.replyTo && !existingMessage.replyTo) {
    await models.DiscordConversationMessages.updateOne(
      { _id: existingMessage._id },
      { $set: { replyTo: activity.replyTo } },
    );
    await models.ConversationMessages.updateOne(
      {
        'extraData.discordMessageId': activity.messageId,
        replyTo: { $exists: false },
      },
      { $set: { replyTo: activity.replyTo } },
    );
    const updated = await models.ConversationMessages.findOne({
      'extraData.discordMessageId': activity.messageId,
    }).lean();
    if (updated && conversationId) {
      await publishDiscordMessage(conversationId, updated, subdomain);
    }
  }
  return true;
};
