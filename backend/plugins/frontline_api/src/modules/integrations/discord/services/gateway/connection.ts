import { generateModels, IModels } from '~/connectionResolvers';
import { connectGateway } from '@/integrations/discord/gatewayClient';
import { receiveDiscordMessage } from '@/integrations/discord/controller/receiveMessage';
import {
  receiveDiscordMessageDelete,
  receiveDiscordMessageEdit,
} from '@/integrations/discord/controller/receiveMessageUpdates';
import {
  receiveDiscordPollVote,
  receiveDiscordTyping,
} from '@/integrations/discord/controller/receiveActivityEvents';
import { receiveDiscordReaction } from '@/integrations/discord/controller/receiveReactions';
import { IDiscordBotDocument } from '@/integrations/discord/@types/bot';
import {
  getChannel,
  isThreadChannel,
} from '@/integrations/discord/utils/channels';
import { getErrorMessage } from '@/integrations/discord/utils/request';
import { backfillChannelHistory } from '@/integrations/discord/backfill';
import { debugDiscord, debugError } from '@/integrations/discord/debuggers';
import {
  connections,
  connectionKey,
  ownedSubdomains,
  trackOwnedToken,
  untrackToken,
} from '@/integrations/discord/state/gateway';

const channelParentCache = new Map<string, string | null>();

const resolveParentId = async (
  token: string,
  channelId: string,
): Promise<string | null> => {
  if (channelParentCache.has(channelId)) {
    return channelParentCache.get(channelId) ?? null;
  }

  let parentId: string | null = null;
  try {
    const channel = await getChannel(token, channelId);
    parentId =
      (channel && isThreadChannel(channel) && channel.parent_id) || null;
  } catch (e) {
    debugError(
      `Failed to resolve parent for Discord channel ${channelId}: ${
        (e as Error).message
      }`,
    );
    return null;
  }

  channelParentCache.set(channelId, parentId);
  return parentId;
};

const retryPendingBackfill = async (
  models: IModels,
  subdomain: string,
  bot: IDiscordBotDocument,
) => {
  if (!bot.health?.backfillPending) {
    return;
  }

  const claimed = await models.DiscordBots.findOneAndUpdate(
    { _id: bot._id, 'health.backfillPending': true },
    { $set: { 'health.backfillPending': false } },
    { new: true },
  );

  if (!claimed) {
    return;
  }

  backfillChannelHistory({ models, subdomain, bot: claimed }).catch((e) =>
    debugError(
      `Discord pending backfill retry failed for ${bot._id}: ${getErrorMessage(
        e,
      )}`,
    ),
  );
};

export const disconnectDiscordToken = async (
  subdomain: string,
  token: string,
) => {
  const key = connectionKey(subdomain, token);
  const connection = connections.get(key);

  if (connection) {
    try {
      await connection.destroy();
    } catch (e) {
      debugError(`Failed to close Discord gateway: ${(e as Error).message}`);
    }
    connections.delete(key);
  }

  untrackToken(subdomain, token);
};

export const connectDiscordToken = async (subdomain: string, token: string) => {
  if (!token || connections.has(connectionKey(subdomain, token))) {
    return;
  }

  if (!ownedSubdomains.has(subdomain)) {
    return;
  }

  const models = await generateModels(subdomain);

  const readyBot = await models.DiscordBots.findOne({
    token,
    'health.status': 'healthy',
    erxesApiId: { $nin: [null, ''] },
  });

  if (!readyBot) {
    return;
  }

  const label = readyBot.applicationId || 'discord';

  const usableBot = (bot: IDiscordBotDocument | null) =>
    bot && bot.health?.status === 'healthy' && bot.erxesApiId ? bot : null;

  const resolveBot = async (channelId?: string) => {
    if (!channelId) {
      return null;
    }

    const direct = usableBot(
      await models.DiscordBots.findOne({ token, channelId }).sort({
        createdAt: -1,
      }),
    );
    if (direct) {
      return direct;
    }

    const parentId = await resolveParentId(token, channelId);
    if (!parentId) {
      return null;
    }

    return usableBot(
      await models.DiscordBots.findOne({ token, channelId: parentId }).sort({
        createdAt: -1,
      }),
    );
  };

  try {
    const connection = await connectGateway({
      botId: label,
      token,
      onMessage: async (activity) => {
        try {
          const bot = await resolveBot(activity.channelId);
          if (!bot) return;
          await receiveDiscordMessage({ models, subdomain, bot, activity });
          await retryPendingBackfill(models, subdomain, bot);
        } catch (e) {
          debugError(`Discord message routing failed: ${(e as Error).message}`);
        }
      },
      onMessageEdit: async (activity) => {
        try {
          const bot = await resolveBot(activity.channelId);
          if (!bot) return;
          await receiveDiscordMessageEdit({ models, subdomain, activity });
        } catch (e) {
          debugError(
            `Discord message-edit routing failed: ${(e as Error).message}`,
          );
        }
      },
      onMessageDelete: async (event) => {
        try {
          const bot = await resolveBot(event.channelId);
          if (!bot) return;
          await receiveDiscordMessageDelete({ models, subdomain, event });
        } catch (e) {
          debugError(
            `Discord message-delete routing failed: ${(e as Error).message}`,
          );
        }
      },
      onPollVote: async (event) => {
        try {
          const bot = await resolveBot(event.channelId);
          if (!bot) return;
          await receiveDiscordPollVote({ models, subdomain, bot, event });
        } catch (e) {
          debugError(
            `Discord poll-vote routing failed: ${(e as Error).message}`,
          );
        }
      },
      onReaction: async (event) => {
        try {
          const bot = await resolveBot(event.channelId);
          if (!bot) return;
          await receiveDiscordReaction({ models, subdomain, bot, event });
        } catch (e) {
          debugError(
            `Discord reaction routing failed: ${(e as Error).message}`,
          );
        }
      },
      onTyping: async (event) => {
        try {
          const bot = await resolveBot(event.channelId);
          if (!bot) return;
          await receiveDiscordTyping({ models, bot, event });
        } catch (e) {
          debugError(`Discord typing routing failed: ${(e as Error).message}`);
        }
      },

      onFatalClose: async ({ reason, tokenValid }) => {
        try {
          await models.DiscordBots.markTokenBroken(token, reason, tokenValid);
          debugError(`Discord bot ${label} marked broken: ${reason}`);
        } catch (e) {
          debugError(
            `Failed to mark Discord bot ${label} broken: ${getErrorMessage(e)}`,
          );
        }

        setImmediate(() => {
          disconnectDiscordToken(subdomain, token).catch((e) =>
            debugError(
              `Failed to drop dead Discord gateway for ${label}: ${getErrorMessage(
                e,
              )}`,
            ),
          );
        });
      },
    });

    if (!ownedSubdomains.has(subdomain)) {
      try {
        await connection.destroy();
      } catch (e) {
        debugError(
          `Failed to close stale Discord gateway: ${(e as Error).message}`,
        );
      }
      return;
    }

    connections.set(connectionKey(subdomain, token), connection);
    trackOwnedToken(subdomain, token);
    debugDiscord(`Connected Discord gateway for app ${label} (${subdomain})`);
  } catch (e) {
    debugError(`Failed to connect Discord gateway: ${(e as Error).message}`);
  }
};

export const connectDiscordBot = async (
  subdomain: string,
  bot: IDiscordBotDocument,
) => {
  if (bot.health?.status !== 'healthy' || !bot.erxesApiId) {
    return;
  }
  await connectDiscordToken(subdomain, bot.token);
};
