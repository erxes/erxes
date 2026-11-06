import {
  DISCORD_BOT_REMOVED_MESSAGE,
  DISCORD_ERROR_CODES,
} from '@/discordIntegration/constants';
import { IModels } from '~/connectionResolvers';
import {
  DiscordApiError,
  describeDiscordError,
  getDiscordApplication,
  getDiscordBotUser,
  isDiscordAuthError,
  isDiscordBotInGuild,
  listDiscordBotGuilds,
  sanitizeDiscordToken,
} from '~/utils/discordClient';

export const requireDiscordToken = (token?: string | null) => {
  const botToken = sanitizeDiscordToken(token);

  if (!botToken) {
    throw new Error('Discord bot token is required');
  }

  return botToken;
};

export const inspectDiscordBot = async (token: string) => {
  try {
    const [bot, application, guilds] = await Promise.all([
      getDiscordBotUser(token),
      getDiscordApplication(token),
      listDiscordBotGuilds(token),
    ]);

    return { bot, application, guilds };
  } catch (error) {
    throw new Error(describeDiscordError(error));
  }
};

const canMeanBotRemoved = (error: unknown) =>
  error instanceof DiscordApiError &&
  (error.code === DISCORD_ERROR_CODES.MISSING_ACCESS ||
    error.code === DISCORD_ERROR_CODES.UNKNOWN_GUILD ||
    error.code === DISCORD_ERROR_CODES.UNKNOWN_CHANNEL);

const markBrokenIfBotRemoved = async (
  models: IModels,
  connectionId: string,
) => {
  try {
    const connection = await models.DiscordConnection.findWithToken({
      _id: connectionId,
    });

    if (
      connection &&
      !(await isDiscordBotInGuild(connection.token, connection.guildId))
    ) {
      await models.DiscordConnection.markBroken(
        connectionId,
        DISCORD_BOT_REMOVED_MESSAGE,
      );
    }
  } catch (error) {
    console.error(
      `Could not check Discord connection ${connectionId}: ${describeDiscordError(
        error,
      )}`,
    );
  }
};

export const recordDiscordFailure = async ({
  models,
  error,
  connectionId,
  configId,
  customerChannelId,
}: {
  models: IModels;
  error: unknown;
  connectionId: string;
  configId?: string;
  customerChannelId?: string;
}) => {
  const message = describeDiscordError(error);

  console.error(
    `Discord request failed for connection ${connectionId}: ${message}`,
  );

  if (configId) {
    await models.DiscordConfig.updateOne(
      { _id: configId },
      { $set: { lastError: message } },
    );
  }

  if (customerChannelId) {
    await models.DiscordCustomerChannel.updateOne(
      { _id: customerChannelId },
      { $set: { lastError: message } },
    );
  }

  if (isDiscordAuthError(error)) {
    await models.DiscordConnection.markBroken(connectionId, message);
  } else if (canMeanBotRemoved(error)) {
    await markBrokenIfBotRemoved(models, connectionId);
  }

  return message;
};

export const runDiscordRequest = async <T>({
  models,
  connectionId,
  configId,
  request,
}: {
  models: IModels;
  connectionId: string;
  configId?: string;
  request: () => Promise<T>;
}): Promise<T> => {
  try {
    return await request();
  } catch (error) {
    throw new Error(
      await recordDiscordFailure({ models, error, connectionId, configId }),
    );
  }
};
