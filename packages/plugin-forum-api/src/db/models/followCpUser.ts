import { Document, Schema, Model, Connection } from 'mongoose';
import { IModels } from './index';

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
      const doc = { followeeId, followerId };
      await models.FollowCpUser.updateOne(doc, doc, { upsert: true });
      return true;
    }
    public static async unfollow(
      followeeId: string,
      followerId: string
    ): Promise<boolean> {
      await models.FollowCpUser.deleteMany({ followeeId, followerId });
      return true;
    }
  }
  followCpUserSchema.loadClass(FollowCpUserModel);

  models.FollowCpUser = con.model<FollowCpUserDocument, IFollowCpUserModel>(
    'forum_follow_cp_users',
    followCpUserSchema
  );
};
