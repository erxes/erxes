import { Document, Schema, Model, Connection } from 'mongoose';
import { IModels } from './index';

export interface IFollowTag {
  _id: any;
  tagId: string;
  followerId: string;
}

const OMIT_FROM_INPUT = ['_id'] as const;

export type FollowTag = Omit<IFollowTag, typeof OMIT_FROM_INPUT[number]>;

export type FollowTagDocument = IFollowTag & Document;

export interface IFollowTagModel extends Model<FollowTagDocument> {
  follow(tagId: string, followerId: string): Promise<boolean>;
  followMany(tagIds: string[], followerId: string): Promise<boolean>;
  unfollow(tagId: string, followerId: string): Promise<boolean>;
  getFollowerIds(
    tagId: string,
    excldueFollowerIds?: string[]
  ): Promise<string[]>;
}

export const followTagSchema = new Schema<FollowTagDocument>({
  tagId: { type: String, required: true },
  followerId: { type: String, required: true }
});

followTagSchema.index({ tagId: 1, followerId: 1 }, { unique: true });
followTagSchema.index({ followerId: 1 });

export const generateFollowTagModel = (
  subdomain: string,
  con: Connection,
  models: IModels
): void => {
  class FollowTagModel {
    public static async follow(
      tagId: string,
      followerId: string
    ): Promise<boolean> {
      const doc = { tagId, followerId };
      await models.FollowTag.updateOne(doc, doc, { upsert: true });
      return true;
    }
    public static async followMany(
      tagIds: string[],
      followerId: string
    ): Promise<boolean> {
      const docs = tagIds.map(tagId => ({ tagId, followerId }));
      await models.FollowTag.bulkWrite(
        docs.map(doc => ({
          updateOne: {
            filter: doc,
            update: doc,
            upsert: true
          }
        }))
      );
      return true;
    }
    public static async unfollow(
      tagId: string,
      followerId: string
    ): Promise<boolean> {
      await models.FollowTag.deleteMany({ tagId, followerId });
      return true;
    }
    public static async getFollowerIds(
      tagId: string,
      excldueFollowerIds?: string[]
    ): Promise<string[]> {
      const query: any = { tagId };
      if (excldueFollowerIds) {
        query.followerId = { $nin: excldueFollowerIds };
      }
      const follows = await models.FollowTag.find(query);
      const followerIds = follows.map(follow => follow.followerId);
      return followerIds;
    }
  }
  followTagSchema.loadClass(FollowTagModel);

  models.FollowTag = con.model<FollowTagDocument, IFollowTagModel>(
    'forum_follow_tag',
    followTagSchema
  );
};
