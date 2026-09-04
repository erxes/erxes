import { Model } from 'mongoose';
import {
  IPollAnswerCount,
  IPollVote,
  IPollVoteDocument,
} from '@/poll/@types/poll';
import { pollVoteSchema } from '@/poll/db/definitions/polls';
import { IModels } from '~/connectionResolvers';

export interface ICastVoteInput {
  pollId: string;
  messageId: string;
  conversationId: string;
  voterId: string;
  customerId?: string;
  visitorId?: string;
  optionIds: string[];
}

export interface IPollVoteModel extends Model<IPollVoteDocument> {
  castVote(doc: ICastVoteInput): Promise<IPollVoteDocument>;
  getMessageVote(
    messageId: string,
    voterId: string,
  ): Promise<IPollVoteDocument | null>;
  countByOption(match: Partial<IPollVote>): Promise<IPollAnswerCount[]>;
  countVoters(match: Partial<IPollVote>): Promise<number>;
}

export const loadPollVoteClass = (models: IModels) => {
  class PollVote {
    public static async castVote(doc: ICastVoteInput) {
      const { messageId, voterId, optionIds, ...rest } = doc;

      const vote = await models.PollVotes.findOneAndUpdate(
        { messageId, voterId },
        { $set: { ...rest, messageId, voterId, optionIds } },
        { new: true, upsert: true, setDefaultsOnInsert: true },
      );

      return vote;
    }

    public static async getMessageVote(messageId: string, voterId: string) {
      return models.PollVotes.findOne({ messageId, voterId }).lean();
    }

    public static async countByOption(match: Partial<IPollVote>) {
      const rows = await models.PollVotes.aggregate<{
        _id: string;
        count: number;
      }>([
        { $match: match },
        { $unwind: '$optionIds' },
        { $group: { _id: '$optionIds', count: { $sum: 1 } } },
      ]);

      return rows.map((row) => ({ id: row._id, count: row.count }));
    }

    public static async countVoters(match: Partial<IPollVote>) {
      return models.PollVotes.countDocuments(match);
    }
  }

  pollVoteSchema.loadClass(PollVote);

  return pollVoteSchema;
};
