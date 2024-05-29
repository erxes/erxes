import { Document, Schema, Model, Connection, Types } from 'mongoose';
import { IModels } from './index';
import { ICpUser } from '../../graphql';

interface IVote {
  contentId: string;
  userId: string;
}

export type VoteDocument = IVote & Document;
export type VoteModel = Model<VoteDocument>;

export const voteSchema = new Schema<VoteDocument>({
  contentId: Types.ObjectId,
  userId: String
});
voteSchema.index({ contentId: 1, userId: 1 }, { unique: true });

type VoteModels = keyof Pick<
  IModels,
  'PostUpVote' | 'CommentUpVote' | 'PostDownVote' | 'CommentDownVote'
>;

const vote = (ToInsert: VoteModels, ToDelete: VoteModels) => async (
  models: IModels,
  contentId: string,
  cpUser?: ICpUser
) => {
  if (!cpUser) throw new Error(`Unauthorized`);
  const doc: IVote = {
    contentId: contentId,
    userId: cpUser.userId
  };

  try {
    await models[ToInsert].create(doc);
  } catch (e) {
    if (e.code != 11000) {
      throw e;
    }
  }
  await models[ToDelete].deleteMany(doc);
};

export const postUpVote = vote('PostUpVote', 'PostDownVote');
export const postDownVote = vote('PostDownVote', 'PostUpVote');
export const commentUpVote = vote('CommentUpVote', 'CommentDownVote');
export const commentDownVote = vote('CommentDownVote', 'CommentUpVote');

export const generateVoteModels = (
  subdomain: string,
  con: Connection,
  models: IModels
): void => {
  models.PostUpVote = con.model<VoteDocument>('forum_post_upvote', voteSchema);
  models.PostDownVote = con.model<VoteDocument>(
    'forum_post_downvote',
    voteSchema
  );
  models.CommentUpVote = con.model<VoteDocument>(
    'forum_comment_upvote',
    voteSchema
  );
  models.CommentDownVote = con.model<VoteDocument>(
    'forum_comment_downvote',
    voteSchema
  );
};
