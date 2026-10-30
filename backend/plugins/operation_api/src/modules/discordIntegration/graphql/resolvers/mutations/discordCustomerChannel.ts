import { ICompany } from 'erxes-api-shared/core-types';
import { sendTRPCMessage } from 'erxes-api-shared/utils';
import { runDiscordRequest } from '@/discordIntegration/utils/discordBot';
import {
  disableDiscordCommands,
  enableDiscordCommands,
} from '@/discordIntegration/utils/discordCommands';
import { IContext } from '~/connectionResolvers';
import { listDiscordGuildChannels } from '~/utils/discordClient';

type TSaveCustomerChannelParams = {
  _id?: string | null;
  connectionId: string;
  channelId: string;
  companyId: string;
  teamId: string;
};

export const discordCustomerChannelMutations = {
  async operationDiscordSaveCustomerChannel(
    _parent: undefined,
    {
      _id,
      connectionId,
      channelId,
      companyId,
      teamId,
    }: TSaveCustomerChannelParams,
    { models, subdomain, user, checkPermission }: IContext,
  ) {
    await checkPermission('teamUpdate');

    const company: ICompany | null = await sendTRPCMessage({
      subdomain,
      pluginName: 'core',
      method: 'query',
      module: 'companies',
      action: 'findOne',
      input: { _id: companyId },
      defaultValue: null,
    });

    const [team, conflict, teamChannel] = await Promise.all([
      models.Team.findOne({ _id: teamId }).lean(),
      models.DiscordCustomerChannel.findOne({
        channelId,
        subdomain,
        ...(_id ? { _id: { $ne: _id } } : {}),
      }).lean(),
      models.DiscordConfig.exists({ channelId, subdomain }),
    ]);

    if (!team) {
      throw new Error('Team not found');
    }

    if (!company) {
      throw new Error('Company not found');
    }

    if (conflict) {
      throw new Error('This Discord channel is already linked to a company');
    }

    if (teamChannel) {
      throw new Error(
        'This channel receives a team’s internal updates. Pick a channel only the company uses.',
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

    const doc = {
      connectionId,
      guildId: connection.guildId,
      channelId,
      channelName: channel.name,
      companyId,
      teamId,
      subdomain,
    };

    if (_id) {
      const previous = await models.DiscordCustomerChannel.findOneAndUpdate(
        { _id, subdomain },
        { $set: doc },
      ).lean();

      if (!previous) {
        throw new Error('Customer channel not found');
      }

      if (previous.channelId !== channelId) {
        await models.DiscordMessage.deleteMany({
          configId: _id,
          audience: 'customer',
          subdomain,
        });
      }
    }

    const saved = _id
      ? await models.DiscordCustomerChannel.findOne({ _id, subdomain }).lean()
      : await models.DiscordCustomerChannel.create({
          ...doc,
          createdBy: user._id,
        });

    if (!connection.commandsRegisteredAt) {
      await enableDiscordCommands({
        models,
        subdomain,
        connectionId,
        replaceEndpoint: false,
      });
    }

    return saved;
  },

  async operationDiscordRemoveCustomerChannel(
    _parent: undefined,
    { _id }: { _id: string },
    { models, subdomain, checkPermission }: IContext,
  ) {
    await checkPermission('teamUpdate');

    await models.DiscordCustomerChannel.deleteOne({ _id, subdomain });
    await models.DiscordMessage.deleteMany({
      configId: _id,
      audience: 'customer',
      subdomain,
    });

    return { success: true };
  },

  async operationDiscordEnableCommands(
    _parent: undefined,
    { _id }: { _id: string },
    { models, subdomain, checkPermission }: IContext,
  ) {
    await checkPermission('teamUpdate');

    return enableDiscordCommands({
      models,
      subdomain,
      connectionId: _id,
      replaceEndpoint: true,
    });
  },

  async operationDiscordDisableCommands(
    _parent: undefined,
    { _id }: { _id: string },
    { models, subdomain, checkPermission }: IContext,
  ) {
    await checkPermission('teamUpdate');

    return disableDiscordCommands({ models, subdomain, connectionId: _id });
  },
};
