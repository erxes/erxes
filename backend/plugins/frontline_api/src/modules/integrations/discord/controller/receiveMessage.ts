import type { IModels } from '~/connectionResolvers';
import type { IDiscordBotDocument } from '@/integrations/discord/@types/bot';
import type { DiscordActivity } from '@/integrations/discord/@types/activity';
import { isIgnorableActivity } from '@/integrations/discord/utils/messages/activity';
import { resolveDiscordMentions } from '@/integrations/discord/utils/messages/mentions';
import { getErrorMessage } from '@/integrations/discord/utils/request';
import { rehostImageAttachments } from '@/integrations/discord/utils/media/attachments';
import { debugError } from '@/integrations/discord/debuggers';
import {
  buildInboxMessageExtraData,
  buildMessagePreview,
} from '@/integrations/discord/utils/messages/preview';
import { getOrCreateCustomer } from '@/integrations/discord/services/persistence/customers';
import {
  findOrCreateDiscordConversation,
  waitForConversationLink,
  syncConversationToCore,
} from '@/integrations/discord/services/persistence/conversations';
import {
  skipExistingDiscordMessage,
  persistAndDispatchMessage,
} from '@/integrations/discord/services/messages/inbound';

/** Persist an inbound Discord message and dispatch it to the inbox. */
export const receiveDiscordMessage = async ({
  models,
  subdomain,
  bot,
  activity,
  skipAutomation = false,
}: {
  models: IModels;
  subdomain: string;
  bot: IDiscordBotDocument;
  activity: DiscordActivity;
  // History backfill replays old messages; it must not re-enroll automations
  // (AI Agent, notifications) as if they just arrived.
  skipAutomation?: boolean;
}) => {
  if (isIgnorableActivity(activity)) {
    return;
  }

  // Without a linked inbox integration there is nowhere to route the message.
  if (!bot.erxesApiId) {
    debugError(
      `Discord bot ${bot._id} has no linked inbox integration (erxesApiId); skipping message ${activity.messageId}`,
    );
    return;
  }

  const {
    content,
    attachments,
    poll,
    embeds,
    stickers,
    voiceMessage,
    forwardedSnapshot,
  } = activity;

  // What we store + show in the inbox: `<@ID>` mentions rewritten to `@Name`.
  // The raw `content` is still used for automation triggers so trigger matching
  // keeps seeing exactly what Discord sent.
  const displayContent = resolveDiscordMentions(content, activity.mentions);

  // Re-host inbound images to erxes storage so they survive Discord's ~24h CDN
  // URL expiry; videos/files keep their CDN URL. Best-effort, never throws.
  const storedAttachments = await rehostImageAttachments(
    subdomain,
    attachments,
  );
  const storedForwardedSnapshot = forwardedSnapshot
    ? {
        ...forwardedSnapshot,
        attachments: await rehostImageAttachments(
          subdomain,
          forwardedSnapshot.attachments || [],
        ),
      }
    : undefined;

  // Structured payloads (poll, embed preview cards) travel on the message's
  // `extraData` and render as cards. The Discord message id is *always* stamped
  // alongside so later events can find this inbox message back: a poll-vote event
  // refreshes tallies, and — since Discord unfurls link/Tenor/Giphy previews a
  // moment after the message and re-delivers it via MESSAGE_UPDATE — the edit
  // handler attaches `embeds` then. Stamping unconditionally is essential for that
  // last case: a plain link has no poll/embeds at create time, so a conditional
  // stamp would leave the unfurl with no message to attach to.
  const extraData = buildInboxMessageExtraData(activity, {
    poll,
    embeds,
    stickers,
    voiceMessage,
    forwardedSnapshot: storedForwardedSnapshot,
  });
  const previewContent = buildMessagePreview(
    displayContent,
    poll,
    embeds,
    storedAttachments,
    stickers,
    voiceMessage,
    Boolean(storedForwardedSnapshot),
  );

  try {
    const customer = await getOrCreateCustomer(
      models,
      subdomain,
      bot,
      activity,
    );

    const created = await findOrCreateDiscordConversation(
      models,
      bot,
      activity,
      displayContent,
    );

    let conversation = await waitForConversationLink(
      models,
      created.conversation,
      created.createdInThisCall,
    );

    // Idempotency guard, ahead of the conversation sync: a re-run history
    // backfill replays messages we've already ingested. The
    // `create-or-update-conversation` sync below resets the inbox conversation to
    // status OPEN with empty `readUserIds`, so running it for a message that adds
    // nothing new would reopen and un-read a closed conversation. Bail out here
    // instead — the Discord message id is globally unique, so an existing mirror
    // row means this exact message was already stored (the create below is still
    // the hard idempotency guard for the live-dispatch race).
    if (
      await skipExistingDiscordMessage({
        models,
        subdomain,
        activity,
        conversationId: conversation.erxesApiId,
      })
    ) {
      return;
    }

    conversation = await syncConversationToCore({
      models,
      subdomain,
      bot,
      conversation,
      createdInThisCall: created.createdInThisCall,
      customer,
      previewContent,
      storedAttachments,
      timestamp: activity.timestamp,
    });

    await persistAndDispatchMessage({
      models,
      subdomain,
      bot,
      activity,
      conversation,
      customer,
      displayContent,
      storedAttachments,
      extraData,
      timestamp: activity.timestamp,
      skipAutomation,
    });
  } catch (error) {
    throw new Error(
      `Error processing Discord message: ${getErrorMessage(error)}`,
    );
  }
};
