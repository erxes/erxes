import type { IModels } from '~/connectionResolvers';
import type { IDiscordBotDocument } from '@/integrations/discord/@types/bot';
import { DiscordApiError } from '@/integrations/discord/errors/DiscordApiError';
import {
  getApplicationInfo,
  getCurrentBotUser,
  resolveMissingIntents,
} from '@/integrations/discord/utils/bot';
import { debugError } from '@/integrations/discord/debuggers';
const probeMissingIntents = async (
  token: string,
): Promise<string[] | undefined> => {
  try {
    const appInfo = await getApplicationInfo(token);
    return resolveMissingIntents(appInfo?.flags);
  } catch (e) {
    debugError(
      `Discord application info probe failed: ${(e as Error).message}`,
    );
    return undefined;
  }
};
export const validateConnection = async (models: IModels, _id: string) => {
  const bot = await models.DiscordBots.getBot(_id);

  const setHealth = async (health: IDiscordBotDocument['health']) =>
    (await models.DiscordBots.findOneAndUpdate(
      { _id },
      {
        $set: {
          health: {
            ...health,
            backfillPending: bot.health?.backfillPending,
          },
        },
      },
      { new: true },
    )) as IDiscordBotDocument;

  try {
    const botUser = await getCurrentBotUser(bot.token);
    const missingIntents = await probeMissingIntents(bot.token);

    return setHealth({
      status: 'healthy',
      isTokenValid: true,
      botUsername: botUser?.username,
      lastVerifiedAt: new Date(),
      lastError: undefined,
      missingIntents,
    });
  } catch (e) {
    debugError(
      `Discord token validation failed for bot ${_id}: ${(e as Error).message}`,
    );

    return setHealth({
      status: 'broken',
      isTokenValid: false,
      lastVerifiedAt: new Date(),
      lastError: 'Invalid bot token',
    });
  }
};
export const markTokenBroken = async (
  models: IModels,
  token: string,
  reason: string,
  tokenValid = false,
) => {
  if (!token) {
    return;
  }

  await models.DiscordBots.updateMany(
    { token },
    {
      $set: {
        'health.status': 'broken',
        'health.isTokenValid': tokenValid,
        'health.lastError': reason,
        'health.lastVerifiedAt': new Date(),
      },
    },
  );
};
export const revalidateToken = async (models: IModels, token: string) => {
  if (!token) {
    return false;
  }

  let botUsername: string | undefined;
  try {
    botUsername = (await getCurrentBotUser(token))?.username;
  } catch (e) {
    const status = e instanceof DiscordApiError ? e.status : undefined;

    if (status !== 401 && status !== 403) {
      debugError(
        `Discord token probe failed transiently (${status ?? 'network'}): ${
          (e as Error).message
        }`,
      );
      return true;
    }

    await models.DiscordBots.markTokenBroken(
      token,
      `Discord rejected this bot token: ${(e as Error).message}`,
    );
    return false;
  }

  const missingIntents = await probeMissingIntents(token);

  await models.DiscordBots.updateMany(
    { token },
    {
      $set: {
        'health.status': 'healthy',
        'health.isTokenValid': true,
        'health.lastVerifiedAt': new Date(),
        ...(botUsername ? { 'health.botUsername': botUsername } : {}),
        ...(missingIntents ? { 'health.missingIntents': missingIntents } : {}),
      },
      $unset: { 'health.lastError': '' },
    },
  );

  return true;
};
