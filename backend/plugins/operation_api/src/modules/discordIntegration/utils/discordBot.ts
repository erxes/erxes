import { IModels } from '~/connectionResolvers';
import {
  describeDiscordError,
  getDiscordApplication,
  getDiscordBotUser,
  isDiscordAuthError,
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

export const recordDiscordFailure = async ({
  models,
  error,
  connectionId,
  configId,
}: {
  models: IModels;
  error: unknown;
  connectionId: string;
  configId?: string;
}) => {
  const message = describeDiscordError(error);

  if (configId) {
    await models.DiscordConfig.updateOne(
      { _id: configId },
      { $set: { lastError: message } },
    );
  }

  if (isDiscordAuthError(error)) {
    await models.DiscordConnection.markBroken(connectionId, message);
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
