import { APIMessage } from 'discord-api-types/v10';
import { IModels } from '~/connectionResolvers';
import { IDiscordBotDocument } from '@/integrations/discord/@types/bot';
import { mapMessageCreateToActivity } from '@/integrations/discord/activity';
import { receiveDiscordMessage } from '@/integrations/discord/controller/receiveMessage';
import {
  listActiveThreads,
  listChannelMessages,
} from '@/integrations/discord/utils';
import { debugDiscord, debugError } from '@/integrations/discord/debuggers';

// Discord caps a single page at 100. We page backward (oldest id of each page →
// next `before` cursor) up to MAX_BACKFILL_PAGES, i.e. the ~1000 most-recent
// messages per channel/thread — enough recent context for most servers without
// an unbounded bulk pull. Raising the cap is the only change needed to go deeper;
// `discordRequest` already backs off on rate limits.
const PAGE_SIZE = 100;
const MAX_BACKFILL_PAGES = 10;

/**
 * Replays a channel's (or thread's) recent messages through the normal ingest
 * path. Pages backward through history (up to MAX_BACKFILL_PAGES), then replays
 * everything oldest-first so conversation order and timestamps are correct
 * across page boundaries. `receiveDiscordMessage` dedups on message id, so this
 * is safe to run alongside (or repeat over) live traffic. Automations are
 * skipped so backfilled history doesn't re-trigger AI/notifications.
 */
const ingestChannelHistory = async (
  models: IModels,
  subdomain: string,
  bot: IDiscordBotDocument,
  channelId: string,
) => {
  // Collect newest→oldest across pages; each page is entirely older than the
  // previous, so the concatenation stays in descending time order.
  const collected: APIMessage[] = [];
  let before: string | undefined;

  for (let page = 0; page < MAX_BACKFILL_PAGES; page++) {
    let messages: APIMessage[] = [];
    try {
      messages = await listChannelMessages(bot.token, channelId, {
        limit: PAGE_SIZE,
        before,
      });
    } catch (e) {
      debugError(
        `Backfill: failed to fetch messages for ${channelId}: ${
          (e as Error).message
        }`,
      );
      break; // keep whatever we already collected
    }

    if (!messages.length) {
      break; // reached the beginning of the channel
    }

    collected.push(...messages);

    if (messages.length < PAGE_SIZE) {
      break; // partial page → no older messages remain
    }
    before = messages[messages.length - 1].id; // oldest id of this page
  }

  // The collected list is newest-first overall; reverse to replay oldest-first.
  for (const raw of [...collected].reverse()) {
    try {
      // REST messages omit guild_id; inject the bot's so activity mapping and
      // automation targeting stay consistent with live events.
      const activity = mapMessageCreateToActivity({
        ...raw,
        guild_id: bot.guildId,
      });
      await receiveDiscordMessage({
        models,
        subdomain,
        bot,
        activity,
        skipAutomation: true,
      });
    } catch (e) {
      debugError(
        `Backfill: failed to ingest message ${raw?.id}: ${
          (e as Error).message
        }`,
      );
    }
  }
};

/**
 * Auto-backfill on connect: pulls the connected channel's recent history plus
 * its active threads into the inbox, so chats written before the bot connected
 * are visible. Best-effort and bounded (~1000 most-recent per channel/thread).
 */
export const backfillChannelHistory = async ({
  models,
  subdomain,
  bot,
}: {
  models: IModels;
  subdomain: string;
  bot: IDiscordBotDocument;
}) => {
  if (!bot.channelId || !bot.erxesApiId) {
    return;
  }

  debugDiscord(
    `Backfilling history for Discord channel ${bot.channelId} (bot ${bot._id})`,
  );

  await ingestChannelHistory(models, subdomain, bot, bot.channelId);

  // Also pull the channel's active threads, if any.
  if (bot.guildId) {
    try {
      const threads = await listActiveThreads(bot.token, bot.guildId);
      const childThreads = threads.filter(
        (t) => t?.parent_id === bot.channelId,
      );
      for (const thread of childThreads) {
        await ingestChannelHistory(models, subdomain, bot, thread.id);
      }
    } catch (e) {
      debugError(
        `Backfill: failed to fetch threads for ${bot.channelId}: ${
          (e as Error).message
        }`,
      );
    }
  }

  debugDiscord(`Backfill complete for Discord channel ${bot.channelId}`);
};
