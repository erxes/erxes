import { Types } from 'mongoose';
import { ICompany } from 'erxes-api-shared/core-types';
import { sendTRPCMessage } from 'erxes-api-shared/utils';
import { IDiscordConnectionDocument } from '@/discordIntegration/@types/discordConnection';
import { DISCORD_CUSTOMER_CHANNEL_LINK_LIMIT } from '@/discordIntegration/constants';
import { runDiscordRequest } from '@/discordIntegration/utils/discordBot';
import {
  disableDiscordCommands,
  enableDiscordCommands,
} from '@/discordIntegration/utils/discordCommands';
import { IContext, IModels } from '~/connectionResolvers';
import { listDiscordGuildChannels } from '~/utils/discordClient';
import { isDuplicateKeyError } from '~/utils/mongoErrors';

type TCustomerChannelTarget = {
  connectionId: string;
  companyId: string;
  teamId: string;
};

type TLinkCustomerChannelsParams = TCustomerChannelTarget & {
  channelIds: string[];
};

type TSaveCustomerChannelParams = TLinkCustomerChannelsParams & {
  _id: string;
};

const listChannelNames = (channels: { channelName: string }[]) => {
  const names = channels.map(({ channelName }) => `#${channelName}`).join(', ');

  return channels.length === 1 ? `${names} is` : `${names} are`;
};

const prepareCustomerChannels = async ({
  models,
  subdomain,
  connectionId,
  channelIds,
  companyId,
  teamId,
  excludeId,
}: TLinkCustomerChannelsParams & {
  models: IModels;
  subdomain: string;
  excludeId?: string;
}) => {
  if (!channelIds.length) {
    throw new Error('Choose at least one channel');
  }

  if (channelIds.length > DISCORD_CUSTOMER_CHANNEL_LINK_LIMIT) {
    throw new Error(
      `Link at most ${DISCORD_CUSTOMER_CHANNEL_LINK_LIMIT} channels at once`,
    );
  }

  const company: ICompany | null = await sendTRPCMessage({
    subdomain,
    pluginName: 'core',
    method: 'query',
    module: 'companies',
    action: 'findOne',
    input: { _id: companyId },
    defaultValue: null,
  });

  const [team, conflicts, teamChannels] = await Promise.all([
    models.Team.findOne({ _id: teamId }).lean(),
    models.DiscordCustomerChannel.find({
      channelId: { $in: channelIds },
      subdomain,
      ...(excludeId ? { _id: { $ne: excludeId } } : {}),
    })
      .select('channelName')
      .lean(),
    models.DiscordConfig.find({ channelId: { $in: channelIds }, subdomain })
      .select('channelName')
      .lean(),
  ]);

  if (!team) {
    throw new Error('Team not found');
  }

  if (!company) {
    throw new Error('Company not found');
  }

  if (conflicts.length) {
    throw new Error(
      `${listChannelNames(conflicts)} already linked to a company`,
    );
  }

  if (teamChannels.length) {
    throw new Error(
      `${listChannelNames(
        teamChannels,
      )} receiving a team’s internal updates. Pick channels only the company uses.`,
    );
  }

  const connection = await models.DiscordConnection.getConnectionWithToken(
    connectionId,
    subdomain,
  );

  const guildChannels = await runDiscordRequest({
    models,
    connectionId: String(connection._id),
    request: () =>
      listDiscordGuildChannels(connection.token, connection.guildId),
  });

  const chosen = guildChannels.filter(({ id }) => channelIds.includes(id));

  if (chosen.length !== channelIds.length) {
    throw new Error(
      channelIds.length === 1
        ? 'The bot cannot see this Discord channel'
        : 'The bot cannot see one of the chosen Discord channels',
    );
  }

  return {
    connection,
    docs: chosen.map((channel) => ({
      connectionId,
      guildId: connection.guildId,
      channelId: channel.id,
      channelName: channel.name,
      companyId,
      teamId,
      subdomain,
    })),
  };
};

const ensureCommandsOn = async (
  models: IModels,
  subdomain: string,
  connection: IDiscordConnectionDocument,
) => {
  if (!connection.commandsRegisteredAt) {
    await enableDiscordCommands({
      models,
      subdomain,
      connectionId: String(connection._id),
      replaceEndpoint: false,
    });
  }
};

const insertCustomerChannels = async ({
  models,
  subdomain,
  docs,
  userId,
}: {
  models: IModels;
  subdomain: string;
  docs: Awaited<ReturnType<typeof prepareCustomerChannels>>['docs'];
  userId: string;
}) => {
  const records = docs.map((doc) => ({
    ...doc,
    _id: new Types.ObjectId().toString(),
    createdBy: userId,
  }));
  const recordIds = records.map(({ _id }) => _id);

  if (!records.length) {
    return recordIds;
  }

  try {
    await models.DiscordCustomerChannel.insertMany(records);
  } catch (error) {
    await models.DiscordCustomerChannel.deleteMany({
      _id: { $in: recordIds },
      subdomain,
    });

    if (isDuplicateKeyError(error)) {
      throw new Error(
        'One of these channels was just linked to a company. Refresh and try again.',
      );
    }

    throw error;
  }

  return recordIds;
};

export const discordCustomerChannelMutations = {
  async operationDiscordLinkCustomerChannels(
    _parent: undefined,
    {
      connectionId,
      channelIds,
      companyId,
      teamId,
    }: TLinkCustomerChannelsParams,
    { models, subdomain, user, checkPermission }: IContext,
  ) {
    await checkPermission('teamUpdate');

    const { connection, docs } = await prepareCustomerChannels({
      models,
      subdomain,
      connectionId,
      channelIds: [...new Set(channelIds)],
      companyId,
      teamId,
    });

    const recordIds = await insertCustomerChannels({
      models,
      subdomain,
      docs,
      userId: user._id,
    });

    await ensureCommandsOn(models, subdomain, connection);

    return models.DiscordCustomerChannel.find({
      _id: { $in: recordIds },
      subdomain,
    })
      .sort({ channelName: 1 })
      .lean();
  },

  async operationDiscordSaveCustomerChannel(
    _parent: undefined,
    {
      _id,
      connectionId,
      channelIds,
      companyId,
      teamId,
    }: TSaveCustomerChannelParams,
    { models, subdomain, user, checkPermission }: IContext,
  ) {
    await checkPermission('teamUpdate');

    const current = await models.DiscordCustomerChannel.findOne({
      _id,
      subdomain,
    }).lean();

    if (!current) {
      throw new Error('Customer channel not found');
    }

    const { connection, docs } = await prepareCustomerChannels({
      models,
      subdomain,
      connectionId,
      channelIds: [...new Set(channelIds)],
      companyId,
      teamId,
      excludeId: _id,
    });

    const keptDoc = docs.find(
      ({ channelId }) => channelId === current.channelId,
    );

    const recordIds = await insertCustomerChannels({
      models,
      subdomain,
      docs: docs.filter((doc) => doc !== keptDoc),
      userId: user._id,
    });

    if (keptDoc) {
      await models.DiscordCustomerChannel.updateOne(
        { _id, subdomain },
        { $set: keptDoc },
      );
    } else {
      await models.DiscordCustomerChannel.deleteOne({ _id, subdomain });
    }

    if (!keptDoc || current.companyId !== companyId) {
      await models.DiscordMessage.deleteMany({
        configId: _id,
        audience: 'customer',
        subdomain,
      });
    }

    await ensureCommandsOn(models, subdomain, connection);

    return models.DiscordCustomerChannel.find({
      _id: { $in: keptDoc ? [_id, ...recordIds] : recordIds },
      subdomain,
    })
      .sort({ channelName: 1 })
      .lean();
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
