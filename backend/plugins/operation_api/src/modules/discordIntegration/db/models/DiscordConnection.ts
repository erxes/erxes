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
  findWithSecrets(
    filter: FilterQuery<IDiscordConnectionDocument>,
  ): Promise<IDiscordConnectionDocument | null>;
  markBroken(_id: string, error: string): Promise<void>;
}

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

    public static async findWithSecrets(
      filter: FilterQuery<IDiscordConnectionDocument>,
    ) {
      const connection = await models.DiscordConnection.findOne(filter)
        .select('+token +clientSecret')
        .lean();

      if (!connection) {
        return null;
      }

      const token = openDiscordSecret(connection.token);
      const clientSecret = connection.clientSecret
        ? openDiscordSecret(connection.clientSecret)
        : undefined;
      const resealed: Record<string, string> = {};

      if (token && !isSealedDiscordSecret(connection.token)) {
        const sealed = sealDiscordSecret(token);

        if (isSealedDiscordSecret(sealed)) {
          resealed.token = sealed;
        }
      }

      if (clientSecret && !isSealedDiscordSecret(connection.clientSecret)) {
        const sealed = sealDiscordSecret(clientSecret);

        if (isSealedDiscordSecret(sealed)) {
          resealed.clientSecret = sealed;
        }
      }

      if (Object.keys(resealed).length) {
        await models.DiscordConnection.updateOne(
          { _id: connection._id },
          { $set: resealed },
        );
      }

      return { ...connection, token, clientSecret };
    }

    public static async getConnectionWithToken(_id: string, subdomain: string) {
      const connection = await models.DiscordConnection.findWithSecrets({
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
