import { Model } from 'mongoose';
import {
  ISurveyAnswerCount,
  ISurveyVote,
  ISurveyVoteDocument,
} from '@/survey/@types/survey';
import { surveyVoteSchema } from '@/survey/db/definitions/surveys';
import { IModels } from '~/connectionResolvers';

export interface ICastVoteInput {
  surveyId: string;
  messageId: string;
  conversationId: string;
  voterId: string;
  cpUserId?: string;
  customerId?: string;
  visitorId?: string;
  optionIds: string[];
}

export interface ISurveyVoteModel extends Model<ISurveyVoteDocument> {
  castVote(doc: ICastVoteInput): Promise<ISurveyVoteDocument>;
  getMessageVote(
    messageId: string,
    voterId: string,
  ): Promise<ISurveyVoteDocument | null>;
  countByOption(match: Partial<ISurveyVote>): Promise<ISurveyAnswerCount[]>;
  countVoters(match: Partial<ISurveyVote>): Promise<number>;
}

export const loadSurveyVoteClass = (models: IModels) => {
  class SurveyVote {
    public static async castVote(doc: ICastVoteInput) {
      const { messageId, voterId, optionIds, ...rest } = doc;

      const vote = await models.SurveyVotes.findOneAndUpdate(
        { messageId, voterId },
        { $set: { ...rest, messageId, voterId, optionIds } },
        { new: true, upsert: true, setDefaultsOnInsert: true },
      );

      return vote;
    }

    public static async getMessageVote(messageId: string, voterId: string) {
      return models.SurveyVotes.findOne({ messageId, voterId }).lean();
    }

    public static async countByOption(match: Partial<ISurveyVote>) {
      const rows = await models.SurveyVotes.aggregate<{
        _id: string;
        count: number;
      }>([
        { $match: match },
        { $unwind: '$optionIds' },
        { $group: { _id: '$optionIds', count: { $sum: 1 } } },
      ]);

      return rows.map((row) => ({ id: row._id, count: row.count }));
    }

    public static async countVoters(match: Partial<ISurveyVote>) {
      return models.SurveyVotes.countDocuments(match);
    }
  }

  surveyVoteSchema.loadClass(SurveyVote);

  return surveyVoteSchema;
};
