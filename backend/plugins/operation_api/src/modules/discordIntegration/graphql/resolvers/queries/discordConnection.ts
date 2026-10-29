import {
  inspectDiscordBot,
  requireDiscordToken,
  runDiscordRequest,
} from '@/discordIntegration/utils/discordBot';
import { IContext } from '~/connectionResolvers';
import {
  buildDiscordInviteUrl,
  getDiscordGuildIconUrl,
  listDiscordGuildChannels,
} from '~/utils/discordClient';

export const discordConnectionQueries = {
  async operationDiscordConnections(
    _parent: undefined,
    _args: undefined,
    { models, subdomain, checkPermission }: IContext,
  ) {
    await checkPermission('teamRead');

    return models.DiscordConnection.find({ subdomain })
      .sort({ guildName: 1 })
      .lean();
  },

  async operationDiscordCheckToken(
    _parent: undefined,
    { token }: { token: string },
    { models, subdomain, checkPermission }: IContext,
  ) {
    await checkPermission('teamUpdate');

    const { bot, application, guilds } = await inspectDiscordBot(
      requireDiscordToken(token),
    );

    const connected = await models.DiscordConnection.find({
      subdomain,
      guildId: { $in: guilds.map((guild) => guild.id) },
    })
      .select('guildId')
      .lean();

    const connectedGuildIds = new Set(
      connected.map((connection) => connection.guildId),
    );

    return {
      applicationId: application.id,
      botUserId: bot.id,
      botUsername: bot.username,
      inviteUrl: buildDiscordInviteUrl(application.id),
      guilds: guilds.map((guild) => ({
        id: guild.id,
        name: guild.name,
        iconUrl: getDiscordGuildIconUrl(guild),
        isConnected: connectedGuildIds.has(guild.id),
      })),
    };
  },

  async operationDiscordChannels(
    _parent: undefined,
    { connectionId }: { connectionId: string },
    { models, subdomain, checkPermission }: IContext,
  ) {
    await checkPermission('teamRead');

    const connection = await models.DiscordConnection.getConnectionWithToken(
      connectionId,
      subdomain,
    );

    const channels = await runDiscordRequest({
      models,
      connectionId: String(connection._id),
      request: () =>
        listDiscordGuildChannels(connection.token, connection.guildId),
    });

    return channels.map(({ id, name, type }) => ({ id, name, type }));
  },
};
