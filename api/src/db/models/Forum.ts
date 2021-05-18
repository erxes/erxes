import { Model, model } from 'mongoose';
import {
  forumSchema,
  discussionSchema,
  IForum,
  IForumDocument,
  ITopic,
  ITopDocument,
  IDiscussion,
  IDiscussionDocument
} from './definitions/forum';

export interface IForumModel extends Model<IForumDocument> {
  getForum(_id: string): Promise<IForumDocument>;
  createDoc(docFields: IForum): Promise<IForumDocument>;
  updateDoc(_id: string, docFields: IForum): Promise<IForumDocument>;
  removeDoc(_id: string): void;
}

export const loadForumClass = () => {
  // tslint:disable-next-line:no-shadowed-variable
  class Forum {
    public static async getForum(_id: string) {
      const forum = await Forums.findOne({ _id });

      if (!forum) {
        throw new Error('Forum not found');
      }

      return forum;
    }

    /** Create forum document */

    public static async createDoc(docFields: IForum) {
      return Forums.create({
        ...docFields,
        createdDate: new Date(),
        modifiedDate: new Date()
      });
    }
  }

  forumSchema.loadClass(Forum);

  return forumSchema;
};

loadForumClass();

// tslint:disable-next-line
export const Forums = model<IForumDocument, IForumModel>('forum', forumSchema);
