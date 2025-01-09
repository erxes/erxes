import { IUserDocument } from '@erxes/api-utils/src/types';
import { Document, Schema, Model, Connection, Types, HydratedDocument } from 'mongoose';
import { ICpUser } from '../../graphql';
import { IModels } from './index';
import * as _ from 'lodash';
import { LoginRequiredError } from '../../customErrors';
import { UserTypes } from '../../consts';

export interface PollVote {
  pollOptionId: Types.ObjectId;
  cpUserId: string;
}

const pollVoteSchema = new Schema<PollVote>({
  pollOptionId: { type: Schema.Types.ObjectId, required: true, index: true },
  cpUserId: { type: String, required: true }
});

type PollVoteDocument = HydratedDocument<PollVote>;

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

      const post = await models.Post.findById(pollOption.postId);

      if (!post) {
        throw new Error('Post not found');
      }

      if (
        post.pollEndDate &&
        new Date(post.pollEndDate).getTime() < new Date().getTime()
      ) {
        throw new Error('Poll is closed');
      }

      const doc = {
        pollOptionId,
        cpUserId: cpUser.userId
      };

      if (post.isPollMultiChoice) {
        await models.PollVote.updateOne(doc, { $set: doc }, { upsert: true });
        return true;
      }

      const allOtherOptions = await models.PollOption.find({
        _id: { $ne: pollOptionId },
        postId: pollOption.postId
      });

      // remove existing votes for other options by same user
      await models.PollVote.deleteMany({
        pollOptionId: { $in: allOtherOptions.map(({ _id }) => _id) },
        cpUserId: cpUser.userId
      });

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

      const pollOption = await models.PollOption.findByIdOrThrow(pollOptionId);

      const post = await models.Post.findById(pollOption.postId);

      if (!post) {
        throw new Error('Post not found');
      }

      if (
        post.pollEndDate &&
        new Date(post.pollEndDate).getTime() < new Date().getTime()
      ) {
        throw new Error('Poll is closed');
      }

      await models.PollVote.deleteMany({
        pollOptionId,
        cpUserId: cpUser.userId
      });

      return true;
    }
  }
  pollVoteSchema.loadClass(PollVoteStatics);

  models.PollVote = con.model<PollVote, PollVoteModel>(
    'forum_poll_vote',
    pollVoteSchema
  );
};
