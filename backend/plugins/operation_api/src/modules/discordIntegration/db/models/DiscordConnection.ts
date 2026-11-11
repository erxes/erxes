import { FilterQuery, Model } from 'mongoose';
import {
  IDiscordConnection,
  IDiscordConnectionDocument,
} from '@/discordIntegration/@types/discordConnection';
import {
  DISCORD_MEMBER_LINKING_ON,
  DISCORD_UNREADABLE_TOKEN_MESSAGE,
} from '@/discordIntegration/constants';
import { discordConnectionSchema } from '@/discordIntegration/db/definitions/discordConnection';
import {
  isSealedDiscordSecret,
  openDiscordSecret,
  sealDiscordSecret,
} from '@/discordIntegration/utils/discordSecrets';
import { IModels } from '~/connectionResolvers';
import { isDuplicateKeyError } from '~/utils/mongoErrors';

export interface IDiscordConnectionModel extends Model<IDiscordConnectionDocument> {
  upsertConnection(
    connection: IDiscordConnection,
  ): Promise<IDiscordConnectionDocument | null>;
  getConnectionWithToken(
    _id: string,
    subdomain: string,
  ): Promise<IDiscordConnectionDocument>;
  findWithToken(
    filter: FilterQuery<IDiscordConnectionDocument>,
  ): Promise<IDiscordConnectionDocument | null>;
  findWithClientSecret(
    filter: FilterQuery<IDiscordConnectionDocument>,
  ): Promise<Omit<IDiscordConnectionDocument, 'token'> | null>;
  findLinkingConnection(
    subdomain: string,
  ): Promise<Omit<IDiscordConnectionDocument, 'token'> | null>;
  listWithSecretStatus(
    subdomain: string,
  ): Promise<Omit<IDiscordConnectionDocument, 'token' | 'clientSecret'>[]>;
  markBroken(_id: string, error: string): Promise<void>;
}

const openReadableSecret = (value: string) => {
  try {
    return openDiscordSecret(value);
  } catch {
    return null;
  }
};

const hasReadableClientSecret = ({
  clientSecret,
}: Pick<IDiscordConnection, 'clientSecret'>) =>
  Boolean(clientSecret && openReadableSecret(clientSecret));

export const loadDiscordConnectionClass = (models: IModels) => {
  class DiscordConnectionClass {
    public static async upsertConnection(connection: IDiscordConnection) {
      const filter = {
        guildId: connection.guildId,
        subdomain: connection.subdomain,
      };

      try {
        return await models.DiscordConnection.findOneAndUpdate(
          filter,
          { $set: connection },
          { new: true, upsert: true, setDefaultsOnInsert: true },
        );
      } catch (error) {
        if (isDuplicateKeyError(error)) {
          return models.DiscordConnection.findOneAndUpdate(
            filter,
            { $set: connection },
            { new: true },
          );
        }
        throw error;
      }
    }

    public static async findWithToken(
      filter: FilterQuery<IDiscordConnectionDocument>,
    ) {
      const connection = await models.DiscordConnection.findOne(filter)
        .select('+token')
        .lean();

      if (!connection) {
        return null;
      }

      const token = openReadableSecret(connection.token);

      if (token === null) {
        await models.DiscordConnection.markBroken(
          String(connection._id),
          DISCORD_UNREADABLE_TOKEN_MESSAGE,
        );

        return null;
      }

      if (token && !isSealedDiscordSecret(connection.token)) {
        const sealed = sealDiscordSecret(token);

        if (isSealedDiscordSecret(sealed)) {
          await models.DiscordConnection.updateOne(
            { _id: connection._id },
            { $set: { token: sealed } },
          );
        }
      }

      return { ...connection, token };
    }

    public static async findWithClientSecret(
      filter: FilterQuery<IDiscordConnectionDocument>,
    ) {
      const connection = await models.DiscordConnection.findOne(filter)
        .select('+clientSecret')
        .lean();

      if (!connection?.clientSecret) {
        return connection;
      }

      const clientSecret = openReadableSecret(connection.clientSecret);

      if (clientSecret === null) {
        return {
          ...connection,
          clientSecret: undefined,
          hasClientSecret: false,
        };
      }

      if (!isSealedDiscordSecret(connection.clientSecret)) {
        const sealed = sealDiscordSecret(clientSecret);

        if (isSealedDiscordSecret(sealed)) {
          await models.DiscordConnection.updateOne(
            { _id: connection._id },
            { $set: { clientSecret: sealed } },
          );
        }
      }

      return { ...connection, clientSecret };
    }

    public static async findLinkingConnection(subdomain: string) {
      const connections = await models.DiscordConnection.find({
        subdomain,
        ...DISCORD_MEMBER_LINKING_ON,
      })
        .select('+clientSecret')
        .lean();

      const readable = connections.find(hasReadableClientSecret);

      return readable
        ? models.DiscordConnection.findWithClientSecret({ _id: readable._id })
        : null;
    }

    public static async listWithSecretStatus(subdomain: string) {
      const connections = await models.DiscordConnection.find({ subdomain })
        .select('+clientSecret')
        .sort({ guildName: 1 })
        .lean();

      return connections.map(({ clientSecret, ...connection }) => ({
        ...connection,
        hasClientSecret:
          connection.hasClientSecret &&
          hasReadableClientSecret({ clientSecret }),
      }));
    }

    public static async getConnectionWithToken(_id: string, subdomain: string) {
      const connection = await models.DiscordConnection.findWithToken({
        _id,
        subdomain,
      });

      if (!connection) {
        const exists = await models.DiscordConnection.exists({
          _id,
          subdomain,
        });

        throw new Error(
          exists
            ? DISCORD_UNREADABLE_TOKEN_MESSAGE
            : 'Discord connection not found',
        );
      }

      return connection;
    }

    public static async markBroken(_id: string, error: string) {
      await models.DiscordConnection.updateOne(
        { _id },
        {
          $set: {
            'health.status': 'broken',
            'health.lastError': error,
            'health.lastVerifiedAt': new Date(),
          },
        },
      );
    }
  }

  discordConnectionSchema.loadClass(DiscordConnectionClass);

  return discordConnectionSchema;
};
