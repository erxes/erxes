import { Document, Schema, Model, Connection, Types, HydratedDocument } from 'mongoose';
import { IModels } from './index';
import { ICpUser } from '../../graphql';

interface IVote {
  contentId: Types.ObjectId;
  userId: string;
}

export type VoteDocument = HydratedDocument<IVote>;
export type VoteModel = Model<IVote>;

export const voteSchema = new Schema<IVote>({
  contentId: Schema.Types.ObjectId,
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
    contentId: new Types.ObjectId(contentId),
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
  models.PostUpVote = con.model<IVote>('forum_post_upvote', voteSchema);
  models.PostDownVote = con.model<IVote>(
    'forum_post_downvote',
    voteSchema
  );
  models.CommentUpVote = con.model<IVote>(
    'forum_comment_upvote',
    voteSchema
  );
  models.CommentDownVote = con.model<IVote>(
    'forum_comment_downvote',
    voteSchema
  );
};
