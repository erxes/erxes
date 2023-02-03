import { Model } from 'mongoose';

import { Document, Schema } from 'mongoose';

interface IStory {
  createdAt: Date;

  title: string;
  content: string;
  companyId: string;
  readUserIds: string[];
}

export interface IStoryDocument extends IStory, Document {
  _id: string;
}

const storieschema = new Schema({
  createdAt: { type: Date },

  title: { type: String },
  content: { type: String },
  companyId: { type: String },
  readUserIds: { type: [String] }
});

export interface IStoryModel extends Model<IStoryDocument> {
  saveStory({ _id, doc }): void;
}

export const loadStoryClass = models => {
  class Story {
    /**
     * Marks stories as read
     */
    public static async saveStory({ _id, doc }) {
      if (_id) {
        await models.Stories.update({ _id }, { $set: doc });
        return models.Stories.findOne({ _id });
      }

      doc.createdAt = new Date();

      return models.Stories.create(doc);
    }
  }

  storieschema.loadClass(Story);

  return storieschema;
};
