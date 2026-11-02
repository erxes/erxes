import { createHash } from 'crypto';
import { redis } from 'erxes-api-shared/utils';
import { IDiscordConnectionDocument } from '@/discordIntegration/@types/discordConnection';
import {
  DISCORD_COMMANDS_SYNC_LOCK,
  DISCORD_ERROR_CODES,
  DISCORD_INTERACTIONS_PATH,
  DISCORD_SLASH_COMMANDS,
} from '@/discordIntegration/constants';
import { getDiscordGatewayUrl } from '@/discordIntegration/utils/discordAccountLink';
import { runDiscordRequest } from '@/discordIntegration/utils/discordBot';
import { IModels } from '~/connectionResolvers';
import {
  DiscordApiError,
  buildDiscordInviteUrl,
  deleteDiscordGuildCommand,
  describeDiscordError,
  getDiscordApplication,
  listDiscordGlobalCommands,
  listDiscordGuildCommands,
  updateDiscordApplication,
  upsertDiscordGuildCommand,
} from '~/utils/discordClient';

type TDiscordCommandsArgs = {
  models: IModels;
  subdomain: string;
  connectionId: string;
};

type TGuildCommandsArgs = {
  token: string;
  applicationId: string;
  guildId: string;
};

const COMMAND_NAMES = new Set(DISCORD_SLASH_COMMANDS.map(({ name }) => name));

const LISTED_COMMANDS_LIMIT = 5;

const DISCORD_COMMANDS_VERSION = createHash('sha1')
  .update(JSON.stringify(DISCORD_SLASH_COMMANDS))
  .digest('hex');

export const getDiscordInteractionsUrl = (subdomain: string) =>
  `${getDiscordGatewayUrl(subdomain)}/pl:operation${DISCORD_INTERACTIONS_PATH}`;

const isPublicHttpsUrl = (value: string) => {
  try {
    const { protocol, hostname } = new URL(value);

    return (
      protocol === 'https:' &&
      hostname !== 'localhost' &&
      hostname !== '127.0.0.1' &&
      !hostname.endsWith('.localhost')
    );
  } catch {
    return false;
  }
};

const isMissingAccess = (error: unknown) =>
  error instanceof DiscordApiError &&
  error.code === DISCORD_ERROR_CODES.MISSING_ACCESS;

const setInteractionsEndpoint = async (token: string, url: string) => {
  try {
    await updateDiscordApplication(token, { interactions_endpoint_url: url });
  } catch (error) {
    if (error instanceof DiscordApiError && error.status === 400) {
      throw new Error(
        `Discord could not reach erxes at ${url}. Make sure this address is public and try again.`,
      );
    }
    throw error;
  }
};

const upsertGuildCommands = async (args: TGuildCommandsArgs) => {
  try {
    for (const command of DISCORD_SLASH_COMMANDS) {
      await upsertDiscordGuildCommand({ ...args, command });
    }
  } catch (error) {
    if (isMissingAccess(error)) {
      throw new Error(
        `The bot is not allowed to add slash commands to this server. Add it again with ${buildDiscordInviteUrl(
          args.applicationId,
        )} and turn them on again.`,
      );
    }
    throw error;
  }
};

const removeGuildCommands = async (args: TGuildCommandsArgs) => {
  const commands = await listDiscordGuildCommands(args);

  for (const command of commands) {
    if (COMMAND_NAMES.has(command.name)) {
      await deleteDiscordGuildCommand({ ...args, commandId: command.id });
    }
  }
};

const assertBotHasNoCommands = async (args: TGuildCommandsArgs) => {
  const [globalCommands, guildCommands] = await Promise.all([
    listDiscordGlobalCommands(args.token, args.applicationId),
    listDiscordGuildCommands(args),
  ]);
  const names = [...globalCommands, ...guildCommands].map(
    ({ name }) => `/${name}`,
  );

  if (!names.length) {
    return;
  }

  const listed = names.slice(0, LISTED_COMMANDS_LIMIT).join(', ');
  const more = names.length > LISTED_COMMANDS_LIMIT ? ', …' : '';

  throw new Error(
    `This bot already has its own slash commands (${listed}${more}). Once erxes receives the bot's interactions, Discord stops sending them to the bot. Use a bot made only for erxes, or turn slash commands on here to accept that.`,
  );
};

const registerDiscordCommands = async ({
  models,
  subdomain,
  connectionId,
  connection,
  replaceEndpoint,
}: TDiscordCommandsArgs & {
  connection: IDiscordConnectionDocument;
  replaceEndpoint: boolean;
}) => {
  const interactionsUrl = getDiscordInteractionsUrl(subdomain);

  if (!isPublicHttpsUrl(interactionsUrl)) {
    throw new Error(
      `Discord sends slash commands only to a public HTTPS address, but erxes is at ${interactionsUrl}. Set GATEWAY_URL to a public HTTPS address and try again.`,
    );
  }

  await runDiscordRequest({
    models,
    connectionId,
    request: async () => {
      const application = await getDiscordApplication(connection.token);
      const currentUrl = application.interactions_endpoint_url;

      await models.DiscordConnection.updateOne(
        { _id: connectionId, subdomain },
        { $set: { publicKey: application.verify_key } },
      );

      const guildCommandsArgs = {
        token: connection.token,
        applicationId: application.id,
        guildId: connection.guildId,
      };

      if (currentUrl !== interactionsUrl && !replaceEndpoint) {
        if (currentUrl) {
          throw new Error(
            `This bot already sends slash commands to ${currentUrl}. Turn them on here to point it to erxes instead.`,
          );
        }

        await assertBotHasNoCommands(guildCommandsArgs);
      }

      if (currentUrl !== interactionsUrl) {
        await setInteractionsEndpoint(connection.token, interactionsUrl);
      }

      await upsertGuildCommands(guildCommandsArgs);
    },
  });
};

export const enableDiscordCommands = async ({
  models,
  subdomain,
  connectionId,
  replaceEndpoint,
}: TDiscordCommandsArgs & { replaceEndpoint: boolean }) => {
  const connection = await models.DiscordConnection.getConnectionWithToken(
    connectionId,
    subdomain,
  );

  try {
    await registerDiscordCommands({
      models,
      subdomain,
      connectionId,
      connection,
      replaceEndpoint,
    });
  } catch (error) {
    return models.DiscordConnection.findOneAndUpdate(
      { _id: connectionId, subdomain },
      {
        $set: {
          commandsError: error instanceof Error ? error.message : String(error),
        },
      },
      { new: true },
    );
  }

  return models.DiscordConnection.findOneAndUpdate(
    { _id: connectionId, subdomain },
    {
      $set: {
        commandsRegisteredAt: new Date(),
        commandsVersion: DISCORD_COMMANDS_VERSION,
      },
      $unset: { commandsError: '' },
    },
    { new: true },
  );
};

export const releaseDiscordCommands = async ({
  models,
  subdomain,
  connectionId,
  token,
  applicationId,
  guildId,
  commandsRegistered,
}: TDiscordCommandsArgs &
  TGuildCommandsArgs & {
    commandsRegistered: boolean;
  }) => {
  if (commandsRegistered) {
    try {
      await removeGuildCommands({ token, applicationId, guildId });
    } catch (error) {
      console.error(
        `Could not remove the Discord slash commands from ${guildId}: ${describeDiscordError(
          error,
        )}`,
      );
    }
  }

  try {
    const sharedApplication = await models.DiscordConnection.exists({
      subdomain,
      applicationId,
      _id: { $ne: connectionId },
    });

    if (sharedApplication) {
      return;
    }

    const application = await getDiscordApplication(token);

    if (
      application.interactions_endpoint_url ===
      getDiscordInteractionsUrl(subdomain)
    ) {
      await updateDiscordApplication(token, {
        interactions_endpoint_url: null,
      });
    }
  } catch (error) {
    console.error(
      `Could not clear the Discord interactions endpoint of ${applicationId}: ${describeDiscordError(
        error,
      )}`,
    );
  }
};

export const disableDiscordCommands = async ({
  models,
  subdomain,
  connectionId,
}: TDiscordCommandsArgs) => {
  const connection = await models.DiscordConnection.getConnectionWithToken(
    connectionId,
    subdomain,
  );

  await runDiscordRequest({
    models,
    connectionId,
    request: async () => {
      try {
        await removeGuildCommands({
          token: connection.token,
          applicationId: connection.applicationId,
          guildId: connection.guildId,
        });
      } catch (error) {
        if (!isMissingAccess(error)) {
          throw error;
        }
      }
    },
  });

  return models.DiscordConnection.findOneAndUpdate(
    { _id: connectionId, subdomain },
    {
      $unset: {
        commandsRegisteredAt: '',
        commandsVersion: '',
        commandsError: '',
      },
    },
    { new: true },
  );
};

export const syncDiscordCommands = async ({
  models,
  subdomain,
  connection,
}: {
  models: IModels;
  subdomain: string;
  connection: Pick<
    IDiscordConnectionDocument,
    '_id' | 'commandsRegisteredAt' | 'commandsVersion'
  >;
}) => {
  if (
    !connection.commandsRegisteredAt ||
    connection.commandsVersion === DISCORD_COMMANDS_VERSION
  ) {
    return;
  }

  const connectionId = String(connection._id);
  const locked = await redis.set(
    `${DISCORD_COMMANDS_SYNC_LOCK.keyPrefix}${subdomain}:${connectionId}`,
    '1',
    'EX',
    DISCORD_COMMANDS_SYNC_LOCK.ttlSeconds,
    'NX',
  );

  if (!locked) {
    return;
  }

  const { token, applicationId, guildId } =
    await models.DiscordConnection.getConnectionWithToken(
      connectionId,
      subdomain,
    );

  await runDiscordRequest({
    models,
    connectionId,
    request: () => upsertGuildCommands({ token, applicationId, guildId }),
  });

  await models.DiscordConnection.updateOne(
    { _id: connectionId, subdomain },
    { $set: { commandsVersion: DISCORD_COMMANDS_VERSION } },
  );
};
