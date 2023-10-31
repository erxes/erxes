import { Document, Schema, Model, Connection, Types } from 'mongoose';
import { IModels } from './index';
import * as _ from 'lodash';
import { CpUserLevels } from '../../consts';
import { ICpUser } from '../../graphql';

export interface IForumClientPortalUser {
  _id: any;
  subscriptionEndsAfter?: Date | null;
}

export type ForumClientPortalUserDocument = IForumClientPortalUser & Document;

export interface IForumClientPortalUserModel
  extends Model<ForumClientPortalUserDocument> {
  findByIdOrCreate(_id: string): Promise<ForumClientPortalUserDocument>;
  findByIdOrCreateMany(
    _ids: string[]
  ): Promise<ForumClientPortalUserDocument[]>;
  findAndIsSubscribed(_id: string): Promise<boolean>;
  isSubscribed(doc: IForumClientPortalUser): boolean;

  getUserLevel(cpUser?: ICpUser | null): Promise<CpUserLevels>;
}

export const forumClientPortalUserSchema = new Schema<
  ForumClientPortalUserDocument
>(
  {
    _id: { type: String, required: true },
    subscriptionEndsAfter: Date
  },
  { _id: false }
);

export const generateForumClientPortalUserModel = (
  subdomain: string,
  con: Connection,
  models: IModels
): void => {
  class ForumClientPortalUserModel {
    public static async findByIdOrCreate(
      _id: string
    ): Promise<ForumClientPortalUserDocument> {
      const existing = await models.ForumClientPortalUser.findById(_id);
      if (existing) return existing;
      const doc = new models.ForumClientPortalUser({
        _id,
        subscriptionEndsAfter: null
      });
      await doc.save();
      return doc;
    }
    public static async findByIdOrCreateMany(
      _ids: string[]
    ): Promise<ForumClientPortalUserDocument[]> {
      const existings = await models.ForumClientPortalUser.find({
        _id: { $in: _ids }
      });
      const existingIds = new Set(existings.map(e => e._id));

      const notExistings = _ids
        .filter(_id => !existingIds.has(_id))
        .map(_id => {
          _id;
        });

      await models.ForumClientPortalUser.insertMany(notExistings);

      return await models.ForumClientPortalUser.find({ _id: { $in: _ids } });
    }
    public static async findAndIsSubscribed(_id: string): Promise<boolean> {
      const doc = await models.ForumClientPortalUser.findByIdOrCreate(_id);
      return models.ForumClientPortalUser.isSubscribed(doc);
    }
    public static isSubscribed(doc: IForumClientPortalUser): boolean {
      if (!doc.subscriptionEndsAfter) return false;

      const now = Date.now();
      const subscriptionEndsAfter = doc.subscriptionEndsAfter.getTime();

      return now <= subscriptionEndsAfter;
    }

    public static async getUserLevel(
      cpUser?: ICpUser | null
    ): Promise<CpUserLevels> {
      if (!cpUser?.userId) return 'GUEST';

      const isSubscribed = await models.ForumClientPortalUser.findAndIsSubscribed(
        cpUser.userId
      );
      if (isSubscribed) return 'SUBSCRIBED';

      return 'REGISTERED';
    }
  }
  forumClientPortalUserSchema.loadClass(ForumClientPortalUserModel);

  models.ForumClientPortalUser = con.model<
    ForumClientPortalUserDocument,
    IForumClientPortalUserModel
  >('forum_client_portal_users', forumClientPortalUserSchema);
};
