import { Model } from 'mongoose';

import { Document, Schema } from 'mongoose';

interface IVote {
  createdAt: Date;
  createdUserId: string;

  discussionId: string;
  isUp: boolean;
}

export interface IVoteDocument extends IVote, Document {
  _id: string;
}

const voteSchema = new Schema({
  createdAt: { type: Date },
  createdUserId: { type: String },

  discussionId: { type: String },
  isUp: { type: Boolean }
});

export interface IVoteModel extends Model<IVoteDocument> {
  vote(doc): void;
}

export const loadVoteClass = models => {
  class Vote {
    /**
     * Marks votes as read
     */
    public static async vote(doc) {
      return models.Votes.create(doc);
    }
  }

  voteSchema.loadClass(Vote);

  return voteSchema;
};
