import {
  APIActionRowComponent,
  APIAttachment,
  APIButtonComponentWithURL,
  APIEmbed,
  APIMessage,
  ButtonStyle,
  ComponentType,
} from 'discord-api-types/v10';
import {
  replaceOutputPlaceholders,
  TAutomationProducers,
  TAutomationProducersInput,
} from 'erxes-api-shared/core-modules';
import { IModels } from '~/connectionResolvers';
import {
  DiscordMessageAttachment,
  getErrorMessage,
  openDmChannel,
  rehostImageAttachments,
  sendChannelMessage,
  stopTypingIndicator,
} from '@/integrations/discord/utils';
import {
  normalizeDiscordEmbeds,
  normalizeDiscordPoll,
} from '@/integrations/discord/activity';
import { DiscordEmbed } from '@/integrations/discord/@types/activity';
import { IDiscordConversationDocument } from '@/integrations/discord/@types/conversations';
import { TDiscordTriggerTarget } from '@/integrations/discord/meta/automation/types';
import { debugError } from '@/integrations/discord/debuggers';
import { receiveInboxMessage } from '@/inbox/receiveMessage';

type TReceiveActionInput =
  TAutomationProducersInput[TAutomationProducers.RECEIVE_ACTIONS];

type TSendDiscordMessageParams = {
  models: IModels;
  subdomain: string;
  action: TReceiveActionInput['action'];
  execution: TReceiveActionInput['execution'];
};

// Where the message goes:
//  - conversation: reply into the triggering conversation's channel (default)
//  - channel:      a specific channel of a chosen bot
//  - dm:           a direct message to a chosen user, via a chosen bot
type TDiscordTarget = 'conversation' | 'channel' | 'dm';

type TDiscordButton = { label?: string; url?: string };
type TDiscordEmbed = {
  title?: string;
  description?: string;
  url?: string;
  color?: string;
  imageUrl?: string;
};

// Discord embed colour wants an integer. Accept "#5865F2" or a decimal string.
const parseEmbedColor = (color?: string): number | undefined => {
  if (!color) return undefined;
  const trimmed = color.trim();
  const value = trimmed.startsWith('#')
    ? parseInt(trimmed.slice(1), 16)
    : Number(trimmed);
  return Number.isFinite(value) ? value : undefined;
};

// Builds a single embed object from the form's flat fields, omitting blanks.
const buildEmbeds = (embed?: TDiscordEmbed): APIEmbed[] => {
  if (!embed) return [];

  const out: APIEmbed = {};
  if (embed.title?.trim()) out.title = embed.title.trim();
  if (embed.description?.trim()) out.description = embed.description.trim();
  if (embed.url?.trim()) out.url = embed.url.trim();
  const color = parseEmbedColor(embed.color);
  if (color !== undefined) out.color = color;
  if (embed.imageUrl?.trim()) out.image = { url: embed.imageUrl.trim() };

  return Object.keys(out).length ? [out] : [];
};

// Builds message components: link buttons grouped into action rows of 5. Only
// link buttons are supported — interactive (custom_id) buttons need the
// interactions webhook, which is parked.
const buildComponents = (
  buttons?: TDiscordButton[],
): APIActionRowComponent<APIButtonComponentWithURL>[] => {
  const valid = (buttons || []).filter((b) => b?.label?.trim() && b?.url?.trim());
  if (!valid.length) return [];

  const rows: APIActionRowComponent<APIButtonComponentWithURL>[] = [];
  for (let i = 0; i < valid.length; i += 5) {
    rows.push({
      type: ComponentType.ActionRow,
      components: valid.slice(i, i + 5).map((b) => ({
        type: ComponentType.Button,
        style: ButtonStyle.Link,
        label: (b.label as string).trim(),
        url: (b.url as string).trim(),
      })),
    });
  }
  return rows;
};

const buildFiles = (
  attachments?: DiscordMessageAttachment[],
): DiscordMessageAttachment[] =>
  (attachments || []).filter((a) => a?.url?.trim());

// Maps Discord's create-message response `attachments` into the inbox
// attachment shape, mirroring the inbound gateway mapping in `activity.ts`.
const normalizeSentAttachments = (attachments?: APIAttachment[]) =>
  (Array.isArray(attachments) ? attachments : []).map((att) => ({
    type: att?.content_type || 'application/octet-stream',
    url: att?.url || '',
    name: att?.filename || '',
    size: typeof att?.size === 'number' ? att.size : undefined,
  }));

// Link buttons have no dedicated inbox renderer, so surface each as a
// titled-link embed card — the embed renders its `title` as a clickable link
// when `url` is set — otherwise a button-only reply would show as a blank
// bubble. Filtered to the same valid buttons `buildComponents` sends.
const buttonsToMirrorEmbeds = (buttons?: TDiscordButton[]): DiscordEmbed[] =>
  (buttons || [])
    .filter((b) => b?.label?.trim() && b?.url?.trim())
    .map((b) => ({
      title: (b.label as string).trim(),
      url: (b.url as string).trim(),
    }));

// Finds the inbox conversation to mirror a channel-target reply into. There's
// exactly one conversation per Discord channel, so the match is unambiguous;
// scoped to the sending bot's integration and to synced rows so the mirror
// always has an `erxesApiId` to publish against. Returns null when the channel
// has no inbox conversation yet (the message still goes out to Discord).
const resolveChannelMirror = (
  models: IModels,
  channelId: string,
  integrationId?: string,
): Promise<IDiscordConversationDocument | null> => {
  if (!channelId || !integrationId) {
    return Promise.resolve(null);
  }

  return models.DiscordConversations.findOne({
    channelId: { $eq: channelId },
    integrationId,
    erxesApiId: { $nin: [null, ''] },
  }).exec();
};

/**
 * "Send Discord Message" automation action. Resolves the configured content,
 * embed, buttons and attachments (all of which can reference {{ trigger.* }} or
 * an AI Agent action's output), then sends them as the bot. The destination is
 * one of: the triggering conversation's channel (default), a specific channel,
 * or a DM. The bot's own gateway echo is deduped by messageId.
 */
// skipcq: JS-R1005 — sequential resolve→send→mirror flow; branches are the
// three targets (conversation/channel/DM), clearer inline than extracted.
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
  let token: string;
  let channelId: string;
  let conversation: IDiscordConversationDocument | null = null;

  if (target === 'conversation') {
    // The execution's target is transported as an untyped record; for the
    // Discord message trigger it carries a TDiscordTriggerTarget.
    const conversationErxesApiId = (
      execution?.target as Partial<TDiscordTriggerTarget> | undefined
    )?.conversationId;

    // The Discord-side mirror of the triggering conversation. Usually present,
    // but a reused/stale inbox conversation (e.g. one left over after a bot was
    // reconnected) may have no live mirror — so treat it as optional and fall
    // back to the inbox conversation's integration to find the bot.
    conversation = await models.DiscordConversations.findOne({
      erxesApiId: conversationErxesApiId,
    });

    // Resolve the sending bot from the integration that owns this conversation.
    // Prefer the mirror's integrationId; if the mirror is missing or its
    // integration is stale, fall back to the inbox conversation's integration.
    let integrationId: string | undefined = conversation?.integrationId;
    if (!integrationId && conversationErxesApiId) {
      integrationId = (
        await models.Conversations.findOne({ _id: conversationErxesApiId })
      )?.integrationId;
    }

    const bot = integrationId
      ? await models.DiscordBots.findOne({ erxesApiId: integrationId })
      : null;

    if (!bot) {
      throw new Error(
        'No connected Discord bot for this conversation — its integration may have been removed. Reconnect the bot, or use a Channel/DM target with an explicit bot.',
      );
    }

    // The mirror knows the exact channel/thread the message came from; without
    // it, fall back to the bot's configured channel.
    const resolvedChannelId = conversation?.channelId || bot.channelId;
    if (!resolvedChannelId) {
      throw new Error('Could not resolve a Discord channel for this conversation');
    }

    token = bot.token;
    channelId = resolvedChannelId;
  } else {
    const bot = resolved.botId
      ? await models.DiscordBots.findById(resolved.botId)
      : null;

    if (!bot) {
      throw new Error('Select a Discord bot to send this message from');
    }

    token = bot.token;

    if (target === 'dm') {
      const userId = String(resolved.userId || '').trim();
      if (!userId) {
        throw new Error('Direct message requires a Discord user ID');
      }
      try {
        const dm = await openDmChannel(token, userId);
        channelId = dm?.id;
      } catch (e) {
        debugError(`Failed to open Discord DM channel: ${getErrorMessage(e)}`);
        throw e;
      }
      if (!channelId) {
        throw new Error('Could not open a DM channel with that user');
      }
    } else {
      channelId = String(resolved.channelId || '').trim();
      if (!channelId) {
        throw new Error('Select a channel to send this message to');
      }

      // If this channel already has an inbox conversation, mirror the outbound
      // reply into it — so a channel-target send (e.g. an AI Agent replying into
      // the same channel it was triggered from) shows up in the inbox thread and
      // enters AI history, exactly like the conversation target. Left unmirrored
      // when there's no conversation or the channel is split across several.
      conversation = await resolveChannelMirror(
        models,
        channelId,
        bot.erxesApiId,
      );
    }
  }

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
    try {
      const createdPoll = normalizeDiscordPoll(sent?.poll);
      const mirrorEmbeds = [
        ...(normalizeDiscordEmbeds(sent?.embeds) || []),
        ...buttonsToMirrorEmbeds(resolved.buttons as TDiscordButton[]),
      ];
      
      const mirrorAttachments = await rehostImageAttachments(
        subdomain,
        normalizeSentAttachments(sent?.attachments),
      );

      const extraData =
        createdPoll || mirrorEmbeds.length
          ? {
              ...(createdPoll && { poll: createdPoll }),
              ...(mirrorEmbeds.length && { embeds: mirrorEmbeds }),
              discordMessageId: sent?.id,
            }
          : undefined;

      await models.DiscordConversationMessages.create({
        conversationId: conversation._id,
        messageId: sent?.id,
        createdAt: new Date(),
        content,
        attachments: mirrorAttachments,
        fromBot: true,
      });

      await receiveInboxMessage(subdomain, {
        action: 'create-conversation-message',
        metaInfo: 'replaceContent',
        payload: JSON.stringify({
          conversationId: conversation.erxesApiId,
          content,
          createdAt: new Date(),
          attachments: mirrorAttachments,
          // Structured content (poll + embeds, incl. link buttons rendered as
          // embed cards) the inbox stores on `extraData` and renders as cards.
          extraData,
          // Flag automation-sent replies (e.g. the AI Agent) so the inbox can
          // visually distinguish them from human-written messages.
          fromBot: true,
        }),
      });
    } catch (e) {
      // Discord send already succeeded; only the inbox mirror failed. Surface it
      // in logs but let the action complete so the result is still returned.
      debugError(
        `Discord message sent (${sent?.id}) but failed to mirror into the inbox: ${getErrorMessage(e)}`,
      );
    }
  }

  return {
    result: {
      messageId: sent?.id,
      content,
      conversationId: conversation?.erxesApiId,
    },
  };
};
