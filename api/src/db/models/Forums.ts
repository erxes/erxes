import { Model, model } from 'mongoose';
import Customers from './Customers';
import {
  forumSchema,
  topicSchema,
  discussionSchema,
  IForum,
  IForumDocument,
  ITopic,
  ITopicDocument,
  IDiscussion,
  IDiscussionDocument,
  IComment,
  ICommentDocument,
  commentSchema,
  IForumReactionDocument,
  forumReactionSchema,
  IForumReaction
} from './definitions/forums';

export interface IForumModel extends Model<IForumDocument> {
  getForum(_id: string): Promise<IForumDocument>;
  createDoc(docFields: IForum, userId?: string): Promise<IForumDocument>;
  updateDoc(
    _id: string,
    docFields: IForum,
    userId?: string
  ): Promise<IForumDocument>;
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

    public static async createDoc(docFields: IForum, userId?: string) {
      if (!userId) {
        throw new Error('userId must be supplied');
      }

      return Forums.create({
        ...docFields,
        createdBy: userId,
        createdDate: new Date(),
        modifiedDate: new Date()
      });
    }

    /**
     *  Update forum document
     */

    public static async updateDoc(
      _id: string,
      docFields: IForum,
      userId?: string
    ) {
      if (!userId) {
        throw new Error('userId must be supplied');
      }

      await Forums.updateOne(
        { _id },
        { $set: { ...docFields, modifiedBy: userId, modifiedDate: new Date() } }
      );

      return Forums.findOne({ _id });
    }

    /**
     *  Remove forum document
     */
    public static async removeDoc(_id: string) {
      const forum = await Forums.findOne({ _id });

      if (!forum) {
        throw new Error('Forum not found');
      }

      const childCount = await ForumTopics.find({
        forumId: _id
      }).countDocuments();

      if (childCount > 0) {
        throw new Error("Can't remove a forum");
      }

      return Forums.deleteOne({ _id });
    }
  }

  forumSchema.loadClass(Forum);

  return forumSchema;
};

export interface ITopicModel extends Model<ITopicDocument> {
  getTopic(_id: string): Promise<ITopicDocument>;
  createDoc(docFields: ITopic, userId?: string): Promise<ITopicDocument>;
  updateDoc(
    _id: string,
    docFields: ITopic,
    userId?: string
  ): Promise<ITopicDocument>;
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
    public static async createDoc(docFields: ITopic, userId?: string) {
      if (!userId) {
        throw new Error('userId must be supplied');
      }

      return ForumTopics.create({
        ...docFields,
        createdBy: userId,
        createdDate: new Date(),
        modifiedDate: new Date()
      });
    }

    /**
     *  update forum_topic document
     */
    public static async updateDoc(
      _id: string,
      docFields: ITopic,
      userId?: string
    ) {
      if (!userId) {
        throw new Error('userId must be supplied');
      }

      await ForumTopics.updateOne(
        { _id },
        { $set: { ...docFields, modifiedBy: userId, modifiedDate: new Date() } }
      );

      return ForumTopics.findOne({ _id });
    }

    /**
     *  remove forum_topic document
     */
    public static async removeDoc(_id: string) {
      const topic = await ForumTopics.findOne({ _id });

      if (!topic) {
        throw new Error('Topic not found');
      }

      const childCount = await ForumDiscussions.find({
        topicId: _id
      }).countDocuments();

      if (childCount > 0) {
        throw new Error("Can't remove a topic");
      }

      return ForumTopics.deleteOne({ _id });
    }
  }

  topicSchema.loadClass(Topic);
  return topicSchema;
};

export interface IDiscussionModel extends Model<IDiscussionDocument> {
  getDiscussion(_id: string): Promise<IDiscussionDocument>;
  createDoc(
    docFields: IDiscussion,
    userId?: string
  ): Promise<IDiscussionDocument>;
  updateDoc(
    _id: string,
    docFields: IDiscussion,
    userId?: string
  ): Promise<IDiscussionDocument>;
  removeDoc(_id: string): void;
  vote(
    _id: string,
    customerId: string,
    value: string
  ): Promise<IDiscussionDocument>;
}

const loadDiscussionClass = () => {
  class Discussion {
    /**
     * get one Forum_discussion
     */
    public static async getDiscussion(_id) {
      const discussion = await ForumDiscussions.findOne({ _id });

      if (!discussion) {
        throw new Error('Discussion not found');
      }

      return discussion;
    }
    /**
     * create discussion
     */

    public static async createDoc(docFields: IDiscussion, userId?: string) {
      if (!userId) {
        throw new Error('userId must be supplied');
      }

      return ForumDiscussions.create({
        ...docFields,
        createdBy: userId,
        createdDate: new Date(),
        modifiedDate: new Date()
      });
    }

    /**
     * edit discussion
     */
    public static async updateDoc(
      _id: string,
      docFields: IDiscussion,
      userId?: string
    ) {
      if (!userId) {
        throw new Error('userId must be supplied');
      }

      await ForumDiscussions.updateOne(
        { _id },
        { $set: { ...docFields, modifiedBy: userId, modifiedDate: new Date() } }
      );

      return ForumDiscussions.findOne({ _id });
    }

    /**
     * remove discussion
     */
    public static async removeDoc(_id: string) {
      const discussion = await ForumDiscussions.findOne({ _id });

      if (!discussion) {
        throw new Error('Discussion not found');
      }

      // comment delete when remove discussion
      await DiscussionComments.deleteMany({ discussionId: _id });

      return ForumDiscussions.deleteOne({ _id });
    }

    /**
     * remove discussion
     */
    public static async vote(_id: string, customerId: string, value: string) {
      const discussion = await ForumDiscussions.findOne({ _id });

      if (!discussion) {
        throw new Error('Discussion not found');
      }

      const customer = await Customers.findOne({ _id: customerId });

      if (!customer) {
        throw new Error('Customer not found');
      }

      const { pollOptions = [], pollData = {} } = discussion;

      if (!pollOptions.includes(value)) {
        throw new Error('Wrong value');
      }

      pollOptions.map(key => {
        if (!pollData[key]) {
          pollData[key] = [];
        }

        if (pollData[key].includes(customerId)) {
          pollData[key].pop(customerId);
        }
      });

      pollData[value].push(customerId);

      await ForumDiscussions.updateOne({ _id }, { $set: { pollData } });

      return ForumDiscussions.findOne({ _id });
    }
  }

  discussionSchema.loadClass(Discussion);
  return discussionSchema;
};

export interface ICommentModel extends Model<ICommentDocument> {
  getComment(_id: string): Promise<ICommentDocument>;
  createDoc(docFields: IComment, userId?: string): Promise<ICommentDocument>;
  updateDoc(
    _id: string,
    docFields: IComment,
    userId?: string
  ): Promise<ICommentDocument>;
  removeDoc(_id: string): void;
}

const loadCommentClass = () => {
  class Comment {
    /**
     * Get one comment
     */
    public static async getComment(_id: string) {
      const comment = await DiscussionComments.findOne({ _id });

      if (!comment) {
        throw new Error('Comment not found');
      }

      return comment;
    }

    /**
     * Create new comment
     */
    public static async createDoc(docFields: IComment, userId?: string) {
      if (!userId) {
        throw new Error('userId must be supplied');
      }
      return DiscussionComments.create({
        ...docFields,
        createdBy: userId,
        createdDate: new Date(),
        modifiedDate: new Date()
      });
    }

    /**
     * Update comment
     */
    public static async updateDoc(
      _id: string,
      docFields: IComment,
      userId: string
    ) {
      if (!userId) {
        throw new Error('userId must be supplied');
      }

      await DiscussionComments.updateOne(
        { _id },
        { $set: { ...docFields, modifiedBy: userId, modifiedDate: new Date() } }
      );

      return DiscussionComments.findOne({ _id });
    }

    /**
     * remove comment
     */
    public static async removeDoc(_id: string) {
      const comment = await DiscussionComments.findOne({ _id });

      if (!comment) {
        throw new Error('Comment not found');
      }

      return DiscussionComments.deleteOne({ _id });
    }
  }

  commentSchema.loadClass(Comment);
  return commentSchema;
};

export interface IForumReactionModel extends Model<IForumReactionDocument> {
  createDoc(
    docFields: IForumReaction,
    userId: string
  ): Promise<IForumReactionDocument>;
}

const loadForumReactionClass = () => {
  class ForumReaction {
    public static async createDoc(docFields: IForumReaction, userId: string) {
      return ForumReactions.create({
        ...docFields,
        createdBy: userId,
        createdDate: new Date(),
        modifiedDate: new Date()
      });
    }
  }

  forumReactionSchema.loadClass(ForumReaction);

  return forumReactionSchema;
};

loadForumClass();
loadTopicClass();
loadDiscussionClass();
loadCommentClass();
loadForumReactionClass();

export const Forums = model<IForumDocument, IForumModel>('forums', forumSchema);

export const ForumTopics = model<ITopicDocument, ITopicModel>(
  'forum_topics',
  topicSchema
);

export const ForumDiscussions = model<IDiscussionDocument, IDiscussionModel>(
  'forum_discussions',
  discussionSchema
);

export const DiscussionComments = model<ICommentDocument, ICommentModel>(
  'forum_discussion_comments',
  commentSchema
);

export const ForumReactions = model<
  IForumReactionDocument,
  IForumReactionModel
>('forum_reactions', forumReactionSchema);
