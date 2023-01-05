import { IUserDocument } from '@erxes/api-utils/src/types';
import { Document, Schema, Model, Connection, Types } from 'mongoose';
import { ICpUser } from '../../graphql';
import { IModels } from './index';
import * as _ from 'lodash';
import { LoginRequiredError } from '../../customErrors';
import { UserTypes } from '../../consts';

export interface PollVote {
  _id: any;
  pollOptionId: string;
  cpUserId: string;
}

const pollVoteSchema = new Schema<PollVote>({
  pollOptionId: { type: Schema.Types.ObjectId, required: true, index: true },
  cpUserId: { type: String, required: true }
});

type PollVoteDocument = PollVote & Document;

export interface PollVoteModel extends Model<PollVoteDocument> {
  vote(pollOptionId: string, cpUser?: ICpUser): Promise<boolean>;
  unvote(pollOptionId: string, cpUser?: ICpUser): Promise<boolean>;
}

export const generatePollVoteModel = (
  subdomain: string,
  con: Connection,
  models: IModels
): void => {
  class PollVoteStatics {
    public static async vote(
      pollOptionId: string,
      cpUser?: ICpUser
    ): Promise<boolean> {
      if (!cpUser) throw new LoginRequiredError();
      const pollOption = await models.PollOption.findByIdOrThrow(pollOptionId);

      const allOtherOptions = await models.PollOption.find({
        _id: { $ne: pollOptionId },
        postId: pollOption.postId
      });

      // remove existing votes for other options
      await models.PollVote.deleteMany({
        _id: { $in: allOtherOptions.map(({ _id }) => _id) }
      });

      const doc = {
        pollOptionId,
        cpUserId: cpUser.userId
      };

      await models.PollVote.updateOne(
        doc,
        {
          $set: doc
        },
        {
          upsert: true
        }
      );

      return true;
    }
    public static async unvote(
      pollOptionId: string,
      cpUser?: ICpUser
    ): Promise<boolean> {
      if (!cpUser) throw new LoginRequiredError();

      await models.PollVote.deleteMany({
        pollOptionId,
        cpUserId: cpUser.userId
      });

      return true;
    }
  }
  pollVoteSchema.loadClass(PollVoteStatics);

  models.PollVote = con.model<PollVoteDocument, PollVoteModel>(
    'forum_poll_vote',
    pollVoteSchema
  );
};
