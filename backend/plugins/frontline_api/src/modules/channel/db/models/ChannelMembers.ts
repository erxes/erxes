import { Model, Types } from 'mongoose';
import {
  IChannelMember,
  IChannelMemberDocument,
  ChannelMemberRoles,
} from '@/channel/@types/channel';
import { channelMembers } from '@/channel/db/definitions/channel';
import { IModels } from '~/connectionResolvers';

type IStoredChannelMember = IChannelMember & {
  _id: string | Types.ObjectId;
};

export interface IChannelMemberModel extends Model<IChannelMemberDocument> {
  getChannelMemberById(_id: string): Promise<IStoredChannelMember | null>;
  getChannelMember(
    memberId: string,
    channelId: string,
  ): Promise<IChannelMemberDocument>;
  createChannelMember(doc: IChannelMember): Promise<IChannelMemberDocument>;
  updateChannelMember(
    member: IStoredChannelMember,
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
  removeChannelMembers(
    channelId: string,
    memberIds: string[],
  ): Promise<IChannelMemberDocument>;
}

export const loadChannelMemberClass = (models: IModels) => {
  class ChannelMember {
    public static async getChannelMemberById(_id: string) {
      const member = await models.ChannelMembers.findOne({ _id });

      if (member || !Types.ObjectId.isValid(_id)) {
        return member;
      }

      // Older memberships have Mongo ObjectId IDs. Mongoose casts findOne's
      // _id to the current string schema, so search the legacy value without
      // schema casting when the requested ID has ObjectId syntax.
      const [legacyMember] =
        await models.ChannelMembers.aggregate<IStoredChannelMember>([
          { $match: { _id: new Types.ObjectId(_id) } },
          { $limit: 1 },
        ]);

      return legacyMember || null;
    }

    public static async getChannelMember(memberId: string, channelId: string) {
      return models.ChannelMembers.findOne({ memberId, channelId }).lean();
    }

    public static async createChannelMember(doc: IChannelMember) {
      return models.ChannelMembers.create({ ...doc, createdAt: new Date() });
    }

    public static async updateChannelMember(
      member: IStoredChannelMember,
      role: ChannelMemberRoles,
      userId: string,
    ) {
      const storedId =
        typeof member._id === 'string'
          ? { $literal: member._id }
          : { $toObjectId: member._id.toString() };

      const memberFilter = {
        channelId: member.channelId,
        memberId: member.memberId,
        // Compare the stored ID without Mongoose casting legacy ObjectIds.
        $expr: { $eq: ['$_id', storedId] },
      };
      const channelMember = await models.ChannelMembers.findOne(memberFilter);

      if (!channelMember) {
        throw new Error('Channel member not found');
      }

      if (
        channelMember.role === ChannelMemberRoles.ADMIN &&
        role !== ChannelMemberRoles.ADMIN
      ) {
        const adminsCount = await models.ChannelMembers.countDocuments({
          channelId: channelMember.channelId,
          role: ChannelMemberRoles.ADMIN,
        });

        if (adminsCount <= 1) {
          throw new Error('At least one admin must remain in the channel');
        }
      }

      return models.ChannelMembers.findOneAndUpdate(
        memberFilter,
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

      await models.ChannelMembers.deleteOne({ channelId, memberId });
      return channelMember;
    }
    public static async removeChannelMembers(
      channelId: string,
      memberIds: string[],
    ) {
      const channelMembers = await models.ChannelMembers.find({
        channelId,
        memberId: { $in: memberIds },
      }).lean();

      if (!channelMembers.length) {
        throw new Error('Channel members not found');
      }

      for (const channelMember of channelMembers) {
        if (channelMember.role === ChannelMemberRoles.ADMIN) {
          throw new Error('Admin cannot be removed');
        }
      }

      return models.ChannelMembers.deleteMany({
        channelId,
        memberId: { $in: memberIds },
      });
    }
  }

  channelMembers.loadClass(ChannelMember);

  return channelMembers;
};
