import { Model } from 'mongoose';
import { IDiscordCustomerChannelDocument } from '@/discordIntegration/@types/discordCustomerChannel';
import { discordCustomerChannelSchema } from '@/discordIntegration/db/definitions/discordCustomerChannel';
import { IModels } from '~/connectionResolvers';

export interface IDiscordCustomerChannelModel
  extends Model<IDiscordCustomerChannelDocument> {
  findForChannel(
    subdomain: string,
    channelIds: string[],
  ): Promise<IDiscordCustomerChannelDocument | null>;
}

export const loadDiscordCustomerChannelClass = (models: IModels) => {
  class DiscordCustomerChannelClass {
    public static async findForChannel(
      subdomain: string,
      channelIds: string[],
    ) {
      const ids = channelIds.filter(Boolean);

      if (!ids.length) {
        return null;
      }

      const channels = await models.DiscordCustomerChannel.find({
        subdomain,
        channelId: { $in: ids },
      }).lean();

      return (
        ids
          .map((id) => channels.find((channel) => channel.channelId === id))
          .find(Boolean) ?? null
      );
    }
  }

  discordCustomerChannelSchema.loadClass(DiscordCustomerChannelClass);

  return discordCustomerChannelSchema;
};
