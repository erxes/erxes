import { TDiscordMentionTarget } from '@/discordIntegration/@types/discordConfig';
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
  _id?: string | null;
  teamId: string;
  connectionId: string;
  channelId: string;
  events: TDiscordNotificationEvent[];
  mention?: TDiscordMentionTarget | null;
  mentionEvents?: TDiscordNotificationEvent[] | null;
  isActive?: boolean | null;
};

export const discordConfigMutations = {
  async operationDiscordSaveTeamConfig(
    _parent: undefined,
    {
      _id,
      teamId,
      connectionId,
      channelId,
      events,
      mention,
      mentionEvents,
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
      _id
        ? models.DiscordConfig.findOne({ _id, teamId, subdomain }).lean()
        : null,
    ]);

    if (!team) {
      throw new Error('Team not found');
    }

    if (_id && !previousConfig) {
      throw new Error(
        'This Discord channel is no longer connected to the team',
      );
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

    const config = await models.DiscordConfig.saveConfig(
      {
        teamId,
        connectionId,
        channelId,
        channelName: channel.name,
        events: uniqueEvents,
        mention: mention ?? 'none',
        mentionEvents: [...new Set(mentionEvents ?? [])].filter((event) =>
          uniqueEvents.includes(event),
        ),
        isActive: isActive ?? true,
        lastError: null,
        subdomain,
      },
      _id,
    );

    if (config && previousConfig && previousConfig.channelId !== channelId) {
      await models.DiscordMessage.deleteMany({
        configId: String(config._id),
        subdomain,
      });
    }

    return config;
  },

  async operationDiscordRemoveTeamConfig(
    _parent: undefined,
    { _id }: { _id: string },
    { models, subdomain, checkPermission }: IContext,
  ) {
    await checkPermission('teamUpdate');

    const config = await models.DiscordConfig.findOne({
      _id,
      subdomain,
    }).lean();

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
    { _id }: { _id: string },
    { models, subdomain, checkPermission }: IContext,
  ) {
    await checkPermission('teamUpdate');

    const config = await models.DiscordConfig.findOne({
      _id,
      subdomain,
    }).lean();

    if (!config) {
      throw new Error(
        'This Discord channel is no longer connected to the team',
      );
    }

    const [team, connection] = await Promise.all([
      models.Team.findOne({ _id: config.teamId }).select('name').lean(),
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
