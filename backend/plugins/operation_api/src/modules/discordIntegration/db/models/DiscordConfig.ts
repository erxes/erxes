import { Model } from 'mongoose';
import {
  IDiscordConfig,
  IDiscordConfigDocument,
} from '@/discordIntegration/@types/discordConfig';
import { ensureDiscordConfigIndexes } from '@/discordIntegration/db/discordConfigIndexes';
import { discordConfigSchema } from '@/discordIntegration/db/definitions/discordConfig';
import { IModels } from '~/connectionResolvers';
import { isDuplicateKeyError } from '~/utils/mongoErrors';

const CHANNEL_TAKEN_MESSAGE = 'This channel is already connected to this team';

export interface IDiscordConfigModel extends Model<IDiscordConfigDocument> {
  listByTeam(
    teamId: string,
    subdomain: string,
  ): Promise<IDiscordConfigDocument[]>;
  saveConfig(
    config: IDiscordConfig,
    _id?: string | null,
  ): Promise<IDiscordConfigDocument | null>;
  removeTeamLinks(teamId: string, subdomain: string): Promise<void>;
}

export const loadDiscordConfigClass = (models: IModels) => {
  class DiscordConfigClass {
    public static listByTeam(teamId: string, subdomain: string) {
      return models.DiscordConfig.find({ teamId, subdomain })
        .sort({ createdAt: 1 })
        .lean();
    }

    public static async removeTeamLinks(teamId: string, subdomain: string) {
      const configs = await models.DiscordConfig.find({ teamId, subdomain })
        .select('_id')
        .lean();

      if (configs.length) {
        const configIds = configs.map(({ _id }) => String(_id));

        await models.DiscordMessage.deleteMany({
          configId: { $in: configIds },
          audience: { $ne: 'customer' },
          subdomain,
        });
        await models.DiscordConfig.deleteMany({
          _id: { $in: configIds },
          subdomain,
        });
      }

      await models.DiscordCustomerChannel.removeChannels(subdomain, { teamId });
    }

    public static async saveConfig(
      config: IDiscordConfig,
      _id?: string | null,
    ) {
      const { teamId, channelId, subdomain } = config;

      const taken = await models.DiscordConfig.exists({
        teamId,
        channelId,
        subdomain,
        ...(_id ? { _id: { $ne: _id } } : {}),
      });

      if (taken) {
        throw new Error(CHANNEL_TAKEN_MESSAGE);
      }

      if (_id) {
        return models.DiscordConfig.findOneAndUpdate(
          { _id, teamId, subdomain },
          { $set: config },
          { new: true },
        );
      }

      await ensureDiscordConfigIndexes(models, subdomain);

      try {
        return await models.DiscordConfig.create(config);
      } catch (error) {
        if (isDuplicateKeyError(error)) {
          throw new Error(CHANNEL_TAKEN_MESSAGE);
        }

        throw error;
      }
    }
  }

  discordConfigSchema.loadClass(DiscordConfigClass);

  return discordConfigSchema;
};
