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

export interface PollVoteModel extends Model<PollVoteDocument> {}

export const generatePollVoteModel = (
  subdomain: string,
  con: Connection,
  models: IModels
): void => {
  class PollVoteStatics {}
  pollVoteSchema.loadClass(PollVoteStatics);

  models.PollVote = con.model<PollVoteDocument, PollVoteModel>(
    'forum_poll_vote',
    pollVoteSchema
  );
};
