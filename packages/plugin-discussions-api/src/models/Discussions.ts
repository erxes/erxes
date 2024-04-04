import { Model } from 'mongoose';

import { Document, Schema } from 'mongoose';

interface IDiscussion {
  createdAt: Date;
  createdUserId: string;

  title: string;
  content: string;
  attachments: any[];
  tags: string[];
  questions: string[];
}

export interface IDiscussionDocument extends IDiscussion, Document {
  _id: string;
}

const discussionSchema = new Schema({
  createdAt: { type: Date },
  createdUserId: { type: String },

  title: { type: String },
  content: { type: String },
  attachments: { type: [Object] },
  tags: { type: [String] },
  questions: { type: [String] }
});

export interface IDiscussionModel extends Model<IDiscussionDocument> {
  saveDiscussion({ _id, doc }): void;
}

export const loadDiscussionClass = models => {
  class Discussion {
    /**
     * Marks discussions as read
     */
    public static async saveDiscussion({ _id, doc }) {
      if (_id) {
        await models.Discussions.update({ _id }, { $set: doc });
        return models.Discussions.findOne({ _id });
      }

      doc.createdAt = new Date();

      return models.Discussions.create(doc);
    }
  }

  discussionSchema.loadClass(Discussion);

  return discussionSchema;
};
