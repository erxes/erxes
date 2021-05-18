import { Model, model } from 'mongoose';
import {
  forumSchema,
  topicSchema,
  discussionSchema,
  IForum,
  IForumDocument,
  ITopic,
  ITopicDocument,
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
  class Forum {
    public static async getForum(_id: string) {
      const forum = await Forums.findOne({ _id });

      if (!forum) {
        throw new Error('Forum not found');
      }

      return forum;
    }

    /**
     *  Create forum document
     */

    public static async createDoc(docFields: IForum) {
      return Forums.create({
        ...docFields,
        createdDate: new Date(),
        modifiedDate: new Date()
      });
    }

    /**
     *  Update forum document
     */

    public static async updateDoc(_id: string, docFields: IForum) {
      await Forums.updateOne({ _id }, { $set: docFields });

      return Forums.findOne({ _id });
    }

    /**
     *  Remove forum document
     */
    public static async removeDoc(_id: string) {
      const forum = Forums.findOne({ _id });

      if (!forum) {
        throw new Error('Forum not found');
      }

      return Forums.deleteOne({ _id });
    }
  }

  forumSchema.loadClass(Forum);

  return forumSchema;
};

export interface ITopicModel extends Model<ITopicDocument> {
  getTopic(_id: string): Promise<ITopicDocument>;
  createDoc(docFields: ITopic): Promise<ITopicDocument>;
  updateDoc(_id: string, docFields: ITopic): Promise<ITopicDocument>;
  removeDoc(_id: string): void;
}

export const loadTopicClass = () => {
  class Topic {
    /**
     * get one forum_topic_document
     */
    public static async getTopic(_id: string) {
      const topic = await ForumTopics.findOne({ _id });

      if (!topic) {
        throw new Error('Topic not found');
      }

      return topic;
    }

    /**
     * create forum_topic document
     */
    public static async createDoc(docFields: ITopic) {
      return ForumTopics.create({
        ...docFields,
        createdDate: new Date(),
        modifiedDate: new Date()
      });
    }

    /**
     *  update forum_topic document
     */
    public static async updateDoc(_id: string, docFields: ITopic) {
      await ForumTopics.updateOne({ _id }, { $set: docFields });

      return ForumTopics.findOne({ _id });
    }

    /**
     *  remove forum_topic document
     */
    public static async removeDoc(_id: string) {
      const topic = await ForumTopics.findOne({ _id });

      if (!topic) {
        throw new Error('Forum Topic not found');
      }

      return ForumTopics.deleteOne({ _id });
    }
  }

  topicSchema.loadClass(Topic);
  return topicSchema;
};

loadForumClass();
loadTopicClass();

// tslint:disable-next-line
export const Forums = model<IForumDocument, IForumModel>('forums', forumSchema);

export const ForumTopics = model<ITopicDocument, ITopicModel>(
  'forum_topics',
  forumSchema
);
