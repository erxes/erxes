import { Model } from 'mongoose';
import {
  IChannelMember,
  IChannelMemberDocument,
  ChannelMemberRoles,
} from '~/modules/channel/@types/channel';
import { channelMembers } from '~/modules/channel/db/definitions/channel';
import { IModels } from '~/connectionResolvers';

export interface IChannelMemberModel extends Model<IChannelMemberDocument> {
  getChannelMember(
    memberId: string,
    channelId: string,
  ): Promise<IChannelMemberDocument>;
  createChannelMember(doc: IChannelMember): Promise<IChannelMemberDocument>;
  updateChannelMember(
    _id: string,
    role: ChannelMemberRoles,
    userId: string,
  ): Promise<IChannelMemberDocument>;

  createChannelMembers(
    members: IChannelMember[],
  ): Promise<IChannelMemberDocument[]>;
  removeChannelMember(
    channelId: string,
    memberId: string,
  ): Promise<IChannelMemberDocument>;
}

export const loadChannelMemberClass = (models: IModels) => {
  class ChannelMember {
    public static async getChannelMember(memberId: string, channelId: string) {
      return models.ChannelMembers.findOne({ memberId, channelId }).lean();
    }

    public static async createChannelMember(doc: IChannelMember) {
      return models.ChannelMembers.create({ ...doc, createdAt: new Date() });
    }

    public static async updateChannelMember(
      _id: string,
      role: ChannelMemberRoles,
      userId: string,
    ) {
      const channelMember = await models.ChannelMembers.findOne({ _id });

      if (!channelMember) {
        throw new Error('Channel member not found');
      }

      if (channelMember.role === ChannelMemberRoles.ADMIN) {
        const adminsCount = await models.ChannelMembers.countDocuments({
          channelId: channelMember.channelId,
          role: ChannelMemberRoles.ADMIN,
        });

        if (adminsCount <= 1) {
          throw new Error('At least one admin must remain in the channel');
        }
      }

      return models.ChannelMembers.findOneAndUpdate(
        { _id },
        { $set: { role, updatedBy: userId, updatedAt: new Date() } },
        { new: true, runValidators: true },
      );
    }

    public static async createChannelMembers(members: IChannelMember[]) {
      return models.ChannelMembers.insertMany(members);
    }

    public static async removeChannelMember(
      channelId: string,
      memberId: string,
    ) {
      const channelMember = await models.ChannelMembers.findOne({
        channelId,
        memberId,
      });

      if (!channelMember) {
        throw new Error('Channel member not found');
      }

      if (channelMember.role === ChannelMemberRoles.ADMIN) {
        throw new Error('Admin cannot be removed');
      }

      return models.ChannelMembers.deleteOne({ channelId, memberId });
    }
  }

  channelMembers.loadClass(ChannelMember);

  return channelMembers;
};
