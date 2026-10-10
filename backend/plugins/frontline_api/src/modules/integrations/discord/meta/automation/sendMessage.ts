import { APIMessage } from 'discord-api-types/v10';
import { replaceOutputPlaceholders } from 'erxes-api-shared/core-modules';
import { type DiscordMessageAttachment } from '@/integrations/discord/@types/outgoingMessage';
import { getErrorMessage } from '@/integrations/discord/utils/request';
import { sendChannelMessage } from '@/integrations/discord/utils/outbound/send';
import { stopTypingIndicator } from '@/integrations/discord/utils/typing';
import { debugError } from '@/integrations/discord/debuggers';
import {
  type TSendDiscordMessageParams,
  type TDiscordEmbed,
  type TDiscordButton,
  type TDiscordTarget,
} from '@/integrations/discord/@types/automationMessage';
import {
  buildEmbeds,
  buildComponents,
  buildFiles,
} from '@/integrations/discord/utils/outbound/automationPayload';
import {
  resolveConversationTarget,
  resolveChannelOrDmTarget,
} from '@/integrations/discord/services/automation/target';
import { mirrorSentMessageToInbox } from '@/integrations/discord/services/automation/mirror';

/**
 * "Send Discord Message" automation action. Resolves the configured content,
 * embed, buttons and attachments (all of which can reference {{ trigger.* }} or
 * an AI Agent action's output), then sends them as the bot. The destination is
 * one of: the triggering conversation's channel (default), a specific channel,
 * or a DM. The bot's own gateway echo is deduped by messageId.
 */
export const actionSendDiscordMessage = async ({
  models,
  subdomain,
  action,
  execution,
}: TSendDiscordMessageParams) => {
  const resolved = (await replaceOutputPlaceholders({
    subdomain,
    execution,
    values: (action.config || {}) as Record<string, unknown>,
    defaultValue: '',
  })) as Record<string, unknown>;

  const content =
    typeof resolved.content === 'string' ? resolved.content.trim() : '';
  const embeds = buildEmbeds(resolved.embed as TDiscordEmbed);
  const components = buildComponents(resolved.buttons as TDiscordButton[]);
  const files = buildFiles(resolved.attachments as DiscordMessageAttachment[]);

  if (!content && !embeds.length && !components.length && !files.length) {
    throw new Error(
      'Discord message action requires content, an embed, a button or an attachment',
    );
  }

  const target: TDiscordTarget =
    resolved.target === 'channel' || resolved.target === 'dm'
      ? resolved.target
      : 'conversation';

  // Resolve which bot (token) sends, the destination channel, and the local
  // conversation to mirror into. The conversation target always has one; the
  // channel target reuses the channel's existing conversation when there is an
  // unambiguous one (see resolveChannelMirror); a DM has none (the bot has no
  // DM gateway intent, so DMs are never ingested as inbox conversations).
  const { token, channelId, conversation } =
    target === 'conversation'
      ? await resolveConversationTarget(models, execution)
      : await resolveChannelOrDmTarget(models, target, resolved);

  // The reply is going out now, so stop any "<bot> is typing…" indicator the
  // inbound message started (posting the message also clears it on Discord's side).
  stopTypingIndicator(channelId);

  let sent: APIMessage;
  try {
    sent = await sendChannelMessage({
      token,
      channelId,
      content,
      embeds,
      components,
      files,
    });
  } catch (e) {
    debugError(
      `Failed to send Discord automation message: ${getErrorMessage(e)}`,
    );
    throw e;
  }

  if (conversation) {
    await mirrorSentMessageToInbox({
      models,
      subdomain,
      conversation,
      sent,
      content,
      buttons: resolved.buttons as TDiscordButton[],
    });
  }

  return {
    result: {
      messageId: sent?.id,
      content,
      conversationId: conversation?.erxesApiId,
    },
  };
};
