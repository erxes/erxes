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

const PAGE_SIZE = 100;

const ingestChannelHistory = async (
  models: IModels,
  subdomain: string,
  bot: IDiscordBotDocument,
  channelId: string,
): Promise<{ forbidden: boolean }> => {
  let messages: APIMessage[] = [];
  try {
    messages = await listChannelMessages(bot.token, channelId, {
      limit: PAGE_SIZE,
    });
  } catch (e) {
    const forbidden = e instanceof DiscordApiError && e.status === 403;
    debugError(
      `Backfill: failed to fetch messages for ${channelId}: ${
        (e as Error).message
      }`,
    );
    return { forbidden };
  }

  for (const raw of [...messages].reverse()) {
    try {
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

  if (forbidden) {
    await models.DiscordBots.updateOne(
      { _id: bot._id },
      { $set: { 'health.backfillPending': true } },
    ).catch((e) =>
      debugError(
        `Failed to flag Discord backfill pending for ${
          bot._id
        }: ${getErrorMessage(e)}`,
      ),
    );
    debugDiscord(
      `Backfill deferred for ${bot.channelId} — bot ${bot._id} has no access yet`,
    );
    return;
  }

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
