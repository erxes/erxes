import { APIMessage } from 'discord-api-types/v10';
import { IModels } from '~/connectionResolvers';
import { IDiscordBotDocument } from '@/integrations/discord/@types/bot';
import { mapMessageCreateToActivity } from '@/integrations/discord/activity';
import { receiveDiscordMessage } from '@/integrations/discord/controller/receiveMessage';
import {
  DiscordApiError,
  getErrorMessage,
  listActiveThreads,
  listChannelMessages,
} from '@/integrations/discord/utils';
import { debugDiscord, debugError } from '@/integrations/discord/debuggers';

// Discord caps a single page at 100. We pull only the most-recent page — the
// 100 latest messages per channel/thread — in a single request, enough recent
// context for the inbox without a bulk history pull. `discordRequest` already
// backs off on rate limits.
const PAGE_SIZE = 100;

/**
 * Replays a channel's (or thread's) most-recent page of messages through the
 * normal ingest path, oldest-first so conversation order and timestamps stay
 * correct. `receiveDiscordMessage` dedups on message id, so this is safe to run
 * alongside (or repeat over) live traffic. Automations are skipped so backfilled
 * history doesn't re-trigger AI/notifications.
 */
const ingestChannelHistory = async (
  models: IModels,
  subdomain: string,
  bot: IDiscordBotDocument,
  channelId: string,
): Promise<{ forbidden: boolean }> => {
  let messages: APIMessage[] = [];
  try {
    // Discord returns the newest PAGE_SIZE messages, newest-first, in one call.
    messages = await listChannelMessages(bot.token, channelId, {
      limit: PAGE_SIZE,
    });
  } catch (e) {
    // 403 means the bot can't read this channel (no access granted yet) — the
    // caller flags the bot so the first live message retries. Any other error
    // is a genuine failure we just log and skip.
    const forbidden = e instanceof DiscordApiError && e.status === 403;
    debugError(
      `Backfill: failed to fetch messages for ${channelId}: ${
        (e as Error).message
      }`,
    );
    return { forbidden };
  }

  // The page is newest-first; reverse to replay oldest-first.
  for (const raw of [...messages].reverse()) {
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

  return { forbidden: false };
};

/**
 * Auto-backfill on connect: pulls the connected channel's recent history plus
 * its active threads into the inbox, so chats written before the bot connected
 * are visible. Best-effort and bounded (100 most-recent per channel/thread).
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

  const { forbidden } = await ingestChannelHistory(
    models,
    subdomain,
    bot,
    bot.channelId,
  );

  // The bot can't read this channel yet (e.g. a private channel it hasn't been
  // granted access to). Flag it so the first live message — which Discord only
  // delivers once access IS granted — retries this backfill and pulls the
  // history that was missed. See retryPendingBackfill in initApp.
  if (forbidden) {
    await models.DiscordBots.updateOne(
      { _id: bot._id },
      { $set: { 'health.backfillPending': true } },
    ).catch((e) =>
      debugError(
        `Failed to flag Discord backfill pending for ${bot._id}: ${getErrorMessage(e)}`,
      ),
    );
    debugDiscord(
      `Backfill deferred for ${bot.channelId} — bot ${bot._id} has no access yet`,
    );
    return;
  }

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
