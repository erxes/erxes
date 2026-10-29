import { Model } from 'mongoose';
import {
  IDiscordConfig,
  IDiscordConfigDocument,
} from '@/discordIntegration/@types/discordConfig';
import { discordConfigSchema } from '@/discordIntegration/db/definitions/discordConfig';
import { IModels } from '~/connectionResolvers';
import { isDuplicateKeyError } from '~/utils/mongoErrors';

export interface IDiscordConfigModel extends Model<IDiscordConfigDocument> {
  findByTeam(
    teamId: string,
    subdomain: string,
  ): Promise<IDiscordConfigDocument | null>;
  upsertConfig(config: IDiscordConfig): Promise<IDiscordConfigDocument | null>;
}

export const loadDiscordConfigClass = (models: IModels) => {
  class DiscordConfigClass {
    public static async findByTeam(teamId: string, subdomain: string) {
      return models.DiscordConfig.findOne({ teamId, subdomain }).lean();
    }

    public static async upsertConfig(config: IDiscordConfig) {
      const filter = { teamId: config.teamId, subdomain: config.subdomain };

      try {
        return await models.DiscordConfig.findOneAndUpdate(
          filter,
          { $set: config },
          { new: true, upsert: true, setDefaultsOnInsert: true },
        );
      } catch (error) {
        if (isDuplicateKeyError(error)) {
          return models.DiscordConfig.findOneAndUpdate(
            filter,
            { $set: config },
            { new: true },
          );
        }
        throw error;
      }
    }
  }

  discordConfigSchema.loadClass(DiscordConfigClass);

  return discordConfigSchema;
};
