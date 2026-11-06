import { TContactFieldsSync } from 'erxes-api-shared/core-modules';
import { FilterQuery, Model } from 'mongoose';
import { IDiscordCustomerChannelDocument } from '@/discordIntegration/@types/discordCustomerChannel';
import { discordCustomerChannelSchema } from '@/discordIntegration/db/definitions/discordCustomerChannel';
import { IModels } from '~/connectionResolvers';

export interface IDiscordCustomerChannelModel extends Model<IDiscordCustomerChannelDocument> {
  findForChannel(
    subdomain: string,
    channelIds: string[],
  ): Promise<IDiscordCustomerChannelDocument | null>;
  removeChannels(
    subdomain: string,
    filter: FilterQuery<IDiscordCustomerChannelDocument>,
  ): Promise<void>;
  syncCompanyContacts(
    subdomain: string,
    sync: TContactFieldsSync,
  ): Promise<void>;
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

    public static async removeChannels(
      subdomain: string,
      filter: FilterQuery<IDiscordCustomerChannelDocument>,
    ) {
      const channels = await models.DiscordCustomerChannel.find({
        ...filter,
        subdomain,
      })
        .select('_id')
        .lean();

      if (!channels.length) {
        return;
      }

      const channelIds = channels.map(({ _id }) => String(_id));

      await models.DiscordCustomerChannel.deleteMany({
        _id: { $in: channelIds },
        subdomain,
      });
      await models.DiscordMessage.deleteMany({
        configId: { $in: channelIds },
        audience: 'customer',
        subdomain,
      });
    }

    public static async syncCompanyContacts(
      subdomain: string,
      sync: TContactFieldsSync,
    ) {
      if (sync.kind !== 'company') {
        return;
      }

      if (sync.action === 'remove') {
        await models.DiscordCustomerChannel.removeChannels(subdomain, {
          companyId: { $in: sync.ids },
        });

        return;
      }

      await models.DiscordCustomerChannel.updateMany(
        { companyId: { $in: sync.oldIds }, subdomain },
        { $set: { companyId: sync.newId } },
      );
    }
  }

  discordCustomerChannelSchema.loadClass(DiscordCustomerChannelClass);

  return discordCustomerChannelSchema;
};
