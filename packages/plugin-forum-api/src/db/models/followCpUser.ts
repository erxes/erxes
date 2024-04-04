import { Document, Schema, Model, Connection } from 'mongoose';
import { sendClientPortalMessage } from '../../messageBroker';
import { IModels } from './index';
import { notifyFollowedYou } from './utils';

export interface IFollowCpUser {
  _id: any;
  followeeId: string;
  followerId: string;
}

const OMIT_FROM_INPUT = ['_id'] as const;

export type FollowCpUserInput = Omit<
  IFollowCpUser,
  typeof OMIT_FROM_INPUT[number]
>;

export type FollowCpUserDocument = IFollowCpUser & Document;

export interface IFollowCpUserModel extends Model<FollowCpUserDocument> {
  follow(followeeId: string, followerId: string): Promise<boolean>;
  unfollow(followeeId: string, followerId: string): Promise<boolean>;
  getFollowerIds(
    followeeId: string,
    excludeFollowerIds?: string[]
  ): Promise<string[]>;
}

export const followCpUserSchema = new Schema<FollowCpUserDocument>({
  followeeId: { type: String, required: true },
  followerId: { type: String, required: true }
});

followCpUserSchema.index({ followeeId: 1, followerId: 1 }, { unique: true });
followCpUserSchema.index({ followerId: 1 });

export const generateFollowCpUserModel = (
  subdomain: string,
  con: Connection,
  models: IModels
): void => {
  class FollowCpUserModel {
    public static async follow(
      followeeId: string,
      followerId: string
    ): Promise<boolean> {
      if (followeeId === followerId) {
        throw new Error("You can't follow yourself");
      }

      const doc = { followeeId, followerId };
      const result = await models.FollowCpUser.updateOne(doc, doc, {
        upsert: true
      });

      if (result.upserted?.length) {
        await notifyFollowedYou(subdomain, models, followeeId, followerId);
      }
      return true;
    }
    public static async unfollow(
      followeeId: string,
      followerId: string
    ): Promise<boolean> {
      await models.FollowCpUser.deleteMany({ followeeId, followerId });
      return true;
    }

    public static async getFollowerIds(
      followeeId: string,
      excludeFollowerIds?: string[]
    ): Promise<string[]> {
      const query: any = { followeeId };
      if (excludeFollowerIds) {
        query.followerId = { $nin: excludeFollowerIds };
      }
      const follows = await models.FollowCpUser.find(query);
      const followerIds = follows.map(follow => follow.followerId);
      return followerIds;
    }
  }
  followCpUserSchema.loadClass(FollowCpUserModel);

  models.FollowCpUser = con.model<FollowCpUserDocument, IFollowCpUserModel>(
    'forum_follow_cp_users',
    followCpUserSchema
  );
};
