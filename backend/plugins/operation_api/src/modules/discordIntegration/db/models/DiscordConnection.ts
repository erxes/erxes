import { Model } from 'mongoose';
import {
  IDiscordConnection,
  IDiscordConnectionDocument,
} from '@/discordIntegration/@types/discordConnection';
import { discordConnectionSchema } from '@/discordIntegration/db/definitions/discordConnection';
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

    public static async getConnectionWithToken(_id: string, subdomain: string) {
      const connection = await models.DiscordConnection.findOne({
        _id,
        subdomain,
      })
        .select('+token')
        .lean();

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
