import { FilterQuery, Model } from 'mongoose';
import {
  IDiscordConnection,
  IDiscordConnectionDocument,
} from '@/discordIntegration/@types/discordConnection';
import { discordConnectionSchema } from '@/discordIntegration/db/definitions/discordConnection';
import {
  isSealedDiscordSecret,
  openDiscordSecret,
  sealDiscordSecret,
} from '@/discordIntegration/utils/discordSecrets';
import { IModels } from '~/connectionResolvers';
import { isDuplicateKeyError } from '~/utils/mongoErrors';

export interface IDiscordConnectionModel
  extends Model<IDiscordConnectionDocument> {
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
  dropUnreadableClientSecrets(subdomain: string): Promise<void>;
  markBroken(_id: string, error: string): Promise<void>;
}

const openReadableSecret = (value: string) => {
  try {
    return openDiscordSecret(value);
  } catch {
    return null;
  }
};

export const loadDiscordConnectionClass = (models: IModels) => {
  const dropClientSecrets = (ids: string[]) =>
    models.DiscordConnection.updateMany(
      { _id: { $in: ids } },
      { $unset: { clientSecret: '' }, $set: { hasClientSecret: false } },
    );

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

      const token = openDiscordSecret(connection.token);

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
        await dropClientSecrets([connection._id]);

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

    public static async dropUnreadableClientSecrets(subdomain: string) {
      const connections = await models.DiscordConnection.find({
        subdomain,
        clientSecret: { $nin: [null, ''] },
      })
        .select('+clientSecret')
        .lean();

      const unreadable = connections
        .filter(
          ({ clientSecret }) =>
            clientSecret && openReadableSecret(clientSecret) === null,
        )
        .map(({ _id }) => _id);

      if (unreadable.length) {
        await dropClientSecrets(unreadable);
      }
    }

    public static async getConnectionWithToken(_id: string, subdomain: string) {
      const connection = await models.DiscordConnection.findWithToken({
        _id,
        subdomain,
      });

      if (!connection) {
        throw new Error('Discord connection not found');
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
