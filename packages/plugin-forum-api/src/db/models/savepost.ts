import { Document, Schema, Model, Connection, Types } from 'mongoose';
import { IModels } from './index';
import * as _ from 'lodash';
import { ICpUser } from '../../graphql';
import { LoginRequiredError } from '../../customErrors';

export interface SavedPost {
  _id: any;
  postId: string;
  cpUserId: string;
  createdAt: Date;
}

export type SavedPostDocument = SavedPost & Document;

const OMIT_FROM_INPUT = ['_id', 'createdAt'] as const;

export type SavePostInput = Omit<SavedPost, typeof OMIT_FROM_INPUT[number]>;

export interface SavedPostModel extends Model<SavedPostDocument> {
  savePost(postId: string, cpUser?: ICpUser): Promise<SavedPostDocument>;
  unsavePost(postId: string, cpUser?: ICpUser): Promise<SavedPostDocument>;
  deleteSavedPost(_id: string, cpUser?: ICpUser): Promise<SavedPostDocument>;
}

export const savedPostSchema = new Schema<SavedPostDocument>({
  postId: { type: Schema.Types.ObjectId, required: true },
  cpUserId: { type: String, required: true },
  createdAt: { type: Date, default: () => new Date(), required: true }
});
// for query
savedPostSchema.index({ cpUserId: 1, createdAt: -1 });
// for unique save
savedPostSchema.index({ postId: 1, cpUserId: 1 }, { unique: true });

export const generateSavedPostModel = (
  subdomain: string,
  con: Connection,
  models: IModels
): void => {
  class SavedPostStatics {
    public static async savePost(
      postId: string,
      cpUser?: ICpUser
    ): Promise<SavedPostDocument> {
      if (!cpUser) throw new LoginRequiredError();
      const existing = await models.SavedPost.findOne({
        postId,
        cpUserId: cpUser.userId
      }).lean();
      if (existing) return existing;

      const created = await models.SavedPost.create({
        postId,
        cpUserId: cpUser.userId
      });
      return created;
    }
    public static async unsavePost(
      postId: string,
      cpUser?: ICpUser
    ): Promise<SavedPostDocument> {
      if (!cpUser) throw new LoginRequiredError();
      const existing = await models.SavedPost.findOne({
        postId,
        cpUserId: cpUser.userId
      });
      if (!existing) throw new Error(`Saved post not found`);

      await existing.remove();
      return existing;
    }
    public static async deleteSavedPost(
      _id: string,
      cpUser?: ICpUser
    ): Promise<SavedPost> {
      if (!cpUser) throw new LoginRequiredError();
      const savedPost = await models.SavedPost.findById(_id);
      if (!savedPost) throw new Error('Saved post not found');
      if (savedPost.cpUserId !== cpUser.userId) throw new Error('Unauthorized');
      await savedPost.remove();
      return savedPost;
    }
  }
  savedPostSchema.loadClass(SavedPostStatics);

  models.SavedPost = con.model<SavedPostDocument, SavedPostModel>(
    'forum_saved_posts',
    savedPostSchema
  );
};
