import { TDiscordNotificationEvent } from '@/discordIntegration/@types/discordNotification';
import {
  recordDiscordFailure,
  runDiscordRequest,
} from '@/discordIntegration/utils/discordBot';
import { buildDiscordTestMessage } from '@/discordIntegration/utils/discordCard';
import { IContext } from '~/connectionResolvers';
import {
  createDiscordMessage,
  listDiscordGuildChannels,
} from '~/utils/discordClient';

type TSaveTeamConfigParams = {
  teamId: string;
  connectionId: string;
  channelId: string;
  events: TDiscordNotificationEvent[];
  isActive?: boolean | null;
};

export const discordConfigMutations = {
  async operationDiscordSaveTeamConfig(
    _parent: undefined,
    {
      teamId,
      connectionId,
      channelId,
      events,
      isActive,
    }: TSaveTeamConfigParams,
    { models, subdomain, checkPermission }: IContext,
  ) {
    await checkPermission('teamUpdate');

    const uniqueEvents = [...new Set(events)];

    if (!uniqueEvents.length) {
      throw new Error('Choose at least one event to send to Discord');
    }

    const [team, previousConfig] = await Promise.all([
      models.Team.findOne({ _id: teamId }).lean(),
      models.DiscordConfig.findByTeam(teamId, subdomain),
    ]);

    if (!team) {
      throw new Error('Team not found');
    }

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

    const channel = channels.find(({ id }) => id === channelId);

    if (!channel) {
      throw new Error('The bot cannot see this Discord channel');
    }

    const customerChannel = await models.DiscordCustomerChannel.exists({
      channelId,
      subdomain,
    });

    if (customerChannel) {
      throw new Error(
        'This channel is linked to a company. Pick a channel only your team uses.',
      );
    }

    const config = await models.DiscordConfig.upsertConfig({
      teamId,
      connectionId,
      channelId,
      channelName: channel.name,
      events: uniqueEvents,
      isActive: isActive ?? true,
      lastError: null,
      subdomain,
    });

    if (config && previousConfig && previousConfig.channelId !== channelId) {
      await models.DiscordMessage.deleteMany({
        configId: String(config._id),
        subdomain,
      });
    }

    return config;
  },

  async operationDiscordDisconnectTeam(
    _parent: undefined,
    { teamId }: { teamId: string },
    { models, subdomain, checkPermission }: IContext,
  ) {
    await checkPermission('teamUpdate');

    const team = await models.Team.findOne({ _id: teamId }).lean();

    if (!team) {
      throw new Error('Team not found');
    }

    const config = await models.DiscordConfig.findByTeam(teamId, subdomain);

    if (config) {
      await models.DiscordConfig.deleteOne({ _id: config._id });
      await models.DiscordMessage.deleteMany({
        configId: String(config._id),
        subdomain,
      });
    }

    return { success: true };
  },

  async operationDiscordSendTestMessage(
    _parent: undefined,
    { teamId }: { teamId: string },
    { models, subdomain, checkPermission }: IContext,
  ) {
    await checkPermission('teamUpdate');

    const config = await models.DiscordConfig.findByTeam(teamId, subdomain);

    if (!config) {
      throw new Error('This team is not connected to Discord');
    }

    const [team, connection] = await Promise.all([
      models.Team.findOne({ _id: teamId }).select('name').lean(),
      models.DiscordConnection.getConnectionWithToken(
        config.connectionId,
        subdomain,
      ),
    ]);

    try {
      await createDiscordMessage(
        connection.token,
        config.channelId,
        buildDiscordTestMessage(team?.name || 'this team', config.channelName),
      );
    } catch (error) {
      throw new Error(
        await recordDiscordFailure({
          models,
          error,
          connectionId: String(connection._id),
          configId: String(config._id),
        }),
      );
    }

    return models.DiscordConfig.findOneAndUpdate(
      { _id: config._id },
      { $set: { lastSentAt: new Date(), lastError: null } },
      { new: true },
    ).lean();
  },
};
