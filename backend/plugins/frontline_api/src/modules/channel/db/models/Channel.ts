import { FilterQuery, Model } from 'mongoose';
import { IModels } from '~/connectionResolvers';
import { channelSchema } from '~/modules/channel/db/definitions/channel';
import {
  ChannelMemberRoles,
  IChannel,
  IChannelDocument,
  IChannelFilter,
} from '~/modules/channel/@types/channel';
import { IChannelMember } from '~/modules/channel/@types/channel';
export interface IChannelModel extends Model<IChannelDocument> {
  getChannel(_id: string): Promise<IChannelDocument>;
  getChannels(params: IChannelFilter): Promise<IChannelDocument[]>;

  createChannel({
    channelDoc,
    adminId,
    memberIds,
  }: {
    channelDoc: IChannel;
    adminId: string;
    memberIds: string[];
  }): Promise<IChannelDocument>;
  updateChannel(_id: string, doc: IChannel, userId: string): IChannelDocument;
  updateUserChannels(channelIds: string[], userId: string): IChannelDocument[];
  removeChannel(_id: string): void;
}

export const loadChannelClass = (models: IModels) => {
  class Channel {
    /*
     * Get a Channel
     */
    public static async getChannel(_id: string): Promise<IChannelDocument> {
      const channel = await models.Channels.findOne({ _id }).lean();
      if (!channel) throw new Error('Channel not found');
      return channel;
    }

    public static async createChannel({
      channelDoc,
      memberIds,
      adminId,
    }: {
      channelDoc: IChannel;
      memberIds: string[];
      adminId: string;
    }): Promise<IChannelDocument> {
      if (!adminId) throw new Error('Admin Id must be supplied');

      const channel = await models.Channels.create({
        ...channelDoc,
        createdAt: new Date(),
        createdBy: adminId,
      });

      const roles: IChannelMember[] = [
        {
          memberId: adminId,
          channelId: channel._id,
          role: ChannelMemberRoles.ADMIN,
        },
        ...memberIds.map((memberId) => ({
          memberId,
          channelId: channel._id,
          role: ChannelMemberRoles.MEMBER,
        })),
      ];
      await models.ChannelMembers.createChannelMembers(roles);

      return channel;
    }

    public static async updateChannel(
      _id: string,
      doc: IChannel,
      userId: string,
    ) {
      return models.Channels.findOneAndUpdate(
        { _id },
        { $set: { ...doc, updatedBy: userId, updatedAt: new Date() } },
        { new: true, runValidators: true },
      );
    }

    public static async updateUserChannels(
      channelIds: string[],
      userId: string,
    ): Promise<IChannelDocument[]> {
      await models.ChannelMembers.deleteMany({ memberId: userId });

      const newRoles: IChannelMember[] = channelIds.map((channelId) => ({
        memberId: userId,
        channelId,
        role: ChannelMemberRoles.MEMBER,
      }));
      await models.ChannelMembers.createChannelMembers(newRoles);

      return models.Channels.find({ _id: { $in: channelIds } }).lean();
    }

    public static async removeChannel(_id: string) {
      await Promise.all([
        models.Channels.deleteOne({ _id }),
        models.ChannelMembers.deleteMany({ channelId: _id }),
      ]);
    }

    public static async getChannels(
      params: IChannelFilter,
    ): Promise<IChannelDocument[]> {
      const query: FilterQuery<IChannelDocument> = {};

      if (params.name) query.name = params.name;
      if (params.description) query.description = params.description;

      if (params.userId) {
        const channelIds = await models.ChannelMembers.find({
          memberId: params.userId,
        }).distinct('channelId');
        query._id = { $in: channelIds };
      }

      return models.Channels.find(query).lean();
    }
  }

  channelSchema.loadClass(Channel);

  return channelSchema;
};
