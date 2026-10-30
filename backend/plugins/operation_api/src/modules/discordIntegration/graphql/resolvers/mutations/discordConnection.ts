import {
  inspectDiscordBot,
  requireDiscordToken,
} from '@/discordIntegration/utils/discordBot';
import { enableDiscordCommands } from '@/discordIntegration/utils/discordCommands';
import { sealDiscordSecret } from '@/discordIntegration/utils/discordSecrets';
import { IContext } from '~/connectionResolvers';
import {
  DiscordApiError,
  describeDiscordError,
  getDiscordGuildIconUrl,
  sanitizeDiscordToken,
  verifyDiscordClientSecret,
} from '~/utils/discordClient';

export const discordConnectionMutations = {
  async operationDiscordConnect(
    _parent: undefined,
    { token, guildId }: { token: string; guildId: string },
    { models, subdomain, user, checkPermission }: IContext,
  ) {
    await checkPermission('teamUpdate');

    const botToken = requireDiscordToken(token);
    const { bot, application, guilds } = await inspectDiscordBot(botToken);
    const guild = guilds.find(({ id }) => id === guildId);

    if (!guild) {
      throw new Error(
        'Add the bot to this Discord server before connecting it',
      );
    }

    const previous = await models.DiscordConnection.findOne({
      guildId,
      subdomain,
    }).lean();

    const connection = await models.DiscordConnection.upsertConnection({
      guildId,
      guildName: guild.name,
      guildIconUrl: getDiscordGuildIconUrl(guild),
      applicationId: application.id,
      botUserId: bot.id,
      botUsername: bot.username,
      token: sealDiscordSecret(botToken),
      publicKey: application.verify_key,
      health: {
        status: 'healthy',
        lastVerifiedAt: new Date(),
        lastError: null,
      },
      createdBy: user._id,
      subdomain,
    });

    if (!connection || previous?.applicationId === application.id) {
      return connection;
    }

    if (previous) {
      const configIds = (
        await models.DiscordConfig.find({
          connectionId: String(previous._id),
          subdomain,
        })
          .select('_id')
          .lean()
      ).map((config) => String(config._id));

      if (configIds.length) {
        await models.DiscordMessage.deleteMany({
          configId: { $in: configIds },
          audience: { $ne: 'customer' },
          subdomain,
        });
      }

      await models.DiscordConnection.updateOne(
        { _id: connection._id, subdomain },
        {
          $unset: {
            clientSecret: '',
            commandsRegisteredAt: '',
            commandsVersion: '',
          },
          $set: { hasClientSecret: false },
        },
      );
    }

    return enableDiscordCommands({
      models,
      subdomain,
      connectionId: String(connection._id),
      replaceEndpoint: false,
    });
  },

  async operationDiscordSetClientSecret(
    _parent: undefined,
    { _id, clientSecret }: { _id: string; clientSecret: string },
    { models, subdomain, checkPermission }: IContext,
  ) {
    await checkPermission('teamUpdate');

    const secret = sanitizeDiscordToken(clientSecret);

    if (!secret) {
      throw new Error('Discord client secret is required');
    }

    const connection = await models.DiscordConnection.findOne({
      _id,
      subdomain,
    }).lean();

    if (!connection) {
      throw new Error('Discord connection not found');
    }

    try {
      await verifyDiscordClientSecret({
        applicationId: connection.applicationId,
        clientSecret: secret,
      });
    } catch (error) {
      throw new Error(
        error instanceof DiscordApiError && error.status < 500
          ? 'Discord rejected this client secret. Copy it again from OAuth2 in the Discord Developer Portal.'
          : describeDiscordError(error),
      );
    }

    return models.DiscordConnection.findOneAndUpdate(
      { _id, subdomain },
      {
        $set: {
          clientSecret: sealDiscordSecret(secret),
          hasClientSecret: true,
        },
      },
      { new: true },
    );
  },

  async operationDiscordClearClientSecret(
    _parent: undefined,
    { _id }: { _id: string },
    { models, subdomain, checkPermission }: IContext,
  ) {
    await checkPermission('teamUpdate');

    const connection = await models.DiscordConnection.findOneAndUpdate(
      { _id, subdomain },
      { $unset: { clientSecret: '' }, $set: { hasClientSecret: false } },
      { new: true },
    );

    if (!connection) {
      throw new Error('Discord connection not found');
    }

    return connection;
  },

  async operationDiscordDisconnect(
    _parent: undefined,
    { _id }: { _id: string },
    { models, subdomain, checkPermission }: IContext,
  ) {
    await checkPermission('teamUpdate');

    const connection = await models.DiscordConnection.findOne({
      _id,
      subdomain,
    }).lean();

    if (!connection) {
      throw new Error('Discord connection not found');
    }

    const [linkedTeamCount, customerChannelCount] = await Promise.all([
      models.DiscordConfig.countDocuments({ connectionId: _id, subdomain }),
      models.DiscordCustomerChannel.countDocuments({
        connectionId: _id,
        subdomain,
      }),
    ]);

    if (customerChannelCount > 0) {
      throw new Error(
        `This Discord server still has ${customerChannelCount} customer channel${
          customerChannelCount === 1 ? '' : 's'
        }. Remove them first.`,
      );
    }

    if (linkedTeamCount > 0) {
      throw new Error(
        `This Discord server is still linked to ${linkedTeamCount} team${
          linkedTeamCount === 1 ? '' : 's'
        }`,
      );
    }

    await models.DiscordConnection.deleteOne({ _id, subdomain });

    return { success: true };
  },
};
