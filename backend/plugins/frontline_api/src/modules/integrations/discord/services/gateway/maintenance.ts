import { IModels } from '~/connectionResolvers';

import { IDiscordBotDocument } from '@/integrations/discord/@types/bot';

import { getErrorMessage } from '@/integrations/discord/utils/request';

import { debugDiscord, debugError } from '@/integrations/discord/debuggers';

import { ownedTokens } from '@/integrations/discord/state/gateway';

import { disconnectDiscordToken } from '@/integrations/discord/services/gateway/connection';

import { REVALIDATE_INTERVAL } from '@/integrations/discord/constants/gateway';

export const sweepDiscordOrphanIntegrations = async (
  models: IModels,
  subdomain: string,
) => {
  try {
    const reaped = await models.DiscordBots.sweepOrphanIntegrations();
    if (reaped) {
      debugDiscord(
        `Swept ${reaped} orphan Discord integration(s) for ${subdomain}`,
      );
    }
  } catch (e) {
    debugError(
      `Discord orphan sweep failed for ${subdomain}: ${(e as Error).message}`,
    );
  }
};

export const revalidateStaleDiscordTokens = async (models: IModels) => {
  const cutoff = new Date(Date.now() - REVALIDATE_INTERVAL);

  const stale = await models.DiscordBots.find({
    'health.status': { $in: ['healthy', 'broken'] },
    $or: [
      { 'health.lastVerifiedAt': { $exists: false } },
      { 'health.lastVerifiedAt': { $lt: cutoff } },
    ],
  });

  const tokens = new Set(stale.map((bot) => bot.token).filter(Boolean));

  await Promise.all(
    Array.from(tokens, async (token) => {
      try {
        await models.DiscordBots.revalidateToken(token);
      } catch (e) {
        debugError(`Discord token revalidation failed: ${getErrorMessage(e)}`);
      }
    }),
  );
};

export const computeDesiredDiscordTokens = async (models: IModels) => {
  const bots = await models.DiscordBots.find({ 'health.status': 'healthy' });
  const desired = new Set<string>();

  await Promise.all(
    bots.map(async (rawBot) => {
      let bot: IDiscordBotDocument = rawBot;
      if (!bot.erxesApiId) {
        try {
          bot = await models.DiscordBots.ensureInboxIntegration(
            bot._id,
            bot.createdBy,
          );
        } catch (e) {
          debugError(
            `Failed to ensure inbox integration for bot ${bot._id}: ${
              (e as Error).message
            }`,
          );
          return;
        }
      }
      if (bot.token) {
        desired.add(bot.token);
      }
    }),
  );

  return desired;
};

export const closeUndesiredDiscordSockets = async (
  subdomain: string,
  desired: Set<string>,
) => {
  const owned = ownedTokens.get(subdomain);
  if (!owned) {
    return;
  }

  await Promise.all(
    Array.from(owned)
      .filter((token) => !desired.has(token))
      .map((token) => disconnectDiscordToken(subdomain, token)),
  );
};
