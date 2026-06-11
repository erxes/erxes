import { Model } from 'mongoose';
import { IModels } from '~/connectionResolvers';
import { feedbackSchema } from '@/learning/db/definitions/feedback';
import { IMastraFeedbackDocument } from '@/learning/@types/learning';

export interface IMastraFeedbackModel extends Model<IMastraFeedbackDocument> {
  // Upsert keyed by (messageId, userId) — one vote per user per message,
  // re-voting replaces. Returns the saved doc plus the previous rating so the
  // caller can undo the old reinforcement before applying the new one.
  saveFeedback(args: {
    threadId: string;
    messageId: string;
    userId: string;
    rating: 1 | -1;
    comment?: string;
    learningIdsInContext?: string[];
  }): Promise<{ doc: IMastraFeedbackDocument; previousRating: number | null }>;
  getByMessageIds(
    messageIds: string[],
    userId: string,
  ): Promise<IMastraFeedbackDocument[]>;
}

export const loadFeedbackClass = (_models: IModels) => {
  class MastraFeedback {
    public static async saveFeedback(args: {
      threadId: string;
      messageId: string;
      userId: string;
      rating: 1 | -1;
      comment?: string;
      learningIdsInContext?: string[];
    }) {
      const existing = await _models.MastraFeedback.findOne({
        messageId: args.messageId,
        userId: args.userId,
      });
      const previousRating = existing?.rating ?? null;
      const doc = await _models.MastraFeedback.findOneAndUpdate(
        { messageId: args.messageId, userId: args.userId },
        {
          $set: {
            threadId: args.threadId,
            rating: args.rating,
            comment: args.comment,
            learningIdsInContext: args.learningIdsInContext ?? [],
            createdAt: new Date(),
          },
        },
        { new: true, upsert: true },
      );
      return { doc, previousRating };
    }

    public static async getByMessageIds(messageIds: string[], userId: string) {
      return _models.MastraFeedback.find({
        messageId: { $in: messageIds },
        userId,
      });
    }
  }

  feedbackSchema.loadClass(MastraFeedback);
  return feedbackSchema;
};
