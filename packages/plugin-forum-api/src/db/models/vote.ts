import { Document, Schema, Model, Connection, Types } from 'mongoose';
import { IModels } from './index';
import { ICpUser } from '../../graphql';

interface IVote {
  contentId: string;
  userId: string;
}

export type VoteDocument = IVote & Document;
export type VoteModel = Model<VoteDocument>;

export const voteSchema = new Schema<VoteDocument>(
  {
    contentId: Types.ObjectId,
    userId: String
  },
  {
    _id: false,
    id: false
  }
);
voteSchema.index({ contentId: 1, userId: 1 }, { unique: true });

type VoteModels =
  | 'PostUpVote'
  | 'CommentUpVote'
  | 'PostDownVote'
  | 'CommentDownVote';

const vote = (Insert: VoteModels, Delete: VoteModels) => async (
  models: IModels,
  contentId: string,
  cpUser?: ICpUser
) => {
  if (!cpUser) throw new Error(`Unauthorized`);
  const doc: IVote = {
    contentId: Types.ObjectId(contentId),
    userId: cpUser.userId
  };
  await models[Insert].update(doc, doc, { upsert: true });
  await models[Delete].deleteMany(doc);
};

export const postUpVote = vote('PostUpVote', 'PostDownVote');
export const postDownVote = vote('PostDownVote', 'PostUpVote');
export const commentUpVote = vote('CommentUpVote', 'CommentDownVote');
export const commentDownVote = vote('CommentDownVote', 'CommentUpVote');

export const generateCommentModel = (
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
