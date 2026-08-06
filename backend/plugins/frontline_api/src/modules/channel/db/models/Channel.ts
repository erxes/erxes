import {
  ChannelMemberRoles,
  ChannelScopes,
  IChannel,
  IChannelDocument,
  IChannelFilter,
  IChannelMember,
} from '@/channel/@types/channel';
import { channelSchema } from '@/channel/db/definitions/channel';
import { FilterQuery, Model } from 'mongoose';
import { IModels } from '~/connectionResolvers';

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
  getPersonalChannel(userId: string): Promise<IChannelDocument>;
  updateChannel(
    _id: string,
    doc: IChannel,
    userId: string,
  ): Promise<IChannelDocument>;
  updateUserChannels(
    channelIds: string[],
    userId: string,
  ): Promise<IChannelDocument[]>;
  removeChannel(_id: string): Promise<void>;
}

export const loadChannelClass = (models: IModels) => {
  class Channel {
    /*
     * Get a Channel
     */
    public static async getChannel(_id: string): Promise<IChannelDocument> {
      const channel = await models.Channels.findOne({ _id }).lean();

      if (!channel) throw new Error('Channel not found');

      const pipelineCount = await models.Pipeline.countDocuments({
        channelId: _id,
      });

      const data = {
        ...channel,
        pipelineCount,
      };

      return data;
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

    /*
     * A user's private inbox. Created on demand with exactly one member — the
     * owner, as admin — and no invite path, so the membership-based
     * conversation filters already scope it to that user alone.
     */
    public static async getPersonalChannel(
      userId: string,
    ): Promise<IChannelDocument> {
      if (!userId) throw new Error('User id must be supplied');

      const query = { createdBy: userId, scope: ChannelScopes.PERSONAL };

      const existing = await models.Channels.findOne(query);

      if (existing) return existing;

      try {
        return await models.Channels.createChannel({
          channelDoc: { name: 'Personal inbox', scope: ChannelScopes.PERSONAL },
          adminId: userId,
          memberIds: [],
        });
      } catch (e) {
        // Two connects racing for the same personal channel: the partial unique
        // index lets one win, and the loser reuses it.
        if (e.code !== 11000) throw e;

        const channel = await models.Channels.findOne(query);

        if (!channel) throw e;

        return channel;
      }
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
      // Bulk channel assignment must not revoke the owner's personal channel:
      // it is the only membership that inbox holds, and losing it would hide
      // the user's own conversations from them.
      const personalChannelIds: string[] = await models.Channels.find({
        createdBy: userId,
        scope: ChannelScopes.PERSONAL,
      }).distinct('_id');

      await models.ChannelMembers.deleteMany({
        memberId: userId,
        channelId: { $nin: personalChannelIds },
      });

      const newRoles: IChannelMember[] = channelIds
        .filter((channelId) => !personalChannelIds.includes(channelId))
        .map((channelId) => ({
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
