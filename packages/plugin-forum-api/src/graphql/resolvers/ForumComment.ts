import { IContext } from '..';
import { IObjectTypeResolver } from '@graphql-tools/utils';
import { IPost } from '../../db/models/post';
import { IComment } from '../../db/models/comment';

const ForumComment: IObjectTypeResolver<IComment, IContext> = {
  async post({ postId }, _, { models: { Post } }) {
    return Post.findById(postId).lean();
  },
  async replyTo({ replyToId }, _, { models: { Comment } }) {
    return Comment.findById(replyToId).lean();
  },
  async replies({ _id }, _, { models: { Comment } }) {
    return Comment.find({ replyToId: _id }).lean();
  },
  async createdBy({ createdById }) {
    return createdById && { __typename: 'User', _id: createdById };
  },
  async createdByCp({ createdByCpId }) {
    return (
      createdByCpId && { __typename: 'ClientPortalUser', _id: createdByCpId }
    );
  },

  async upVoteCount({ _id }, _, { models: { CommentUpVote } }) {
    return CommentUpVote.countDocuments({ contentId: _id });
  },
  async downVoteCount({ _id }, _, { models: { CommentDownVote } }) {
    return CommentDownVote.countDocuments({ contentId: _id });
  },

  async upVotes({ _id }, _, { models: { CommentUpVote } }) {
    const upVotes = await CommentUpVote.find({ contentId: _id }).lean();
    return upVotes.map(v => ({
      __typename: 'ClientPortalUser',
      _id: v.userId
    }));
  },
  async downVotes({ _id }, _, { models: { CommentDownVote } }) {
    const downVotes = await CommentDownVote.find({ contentId: _id }).lean();
    return downVotes.map(v => ({
      __typename: 'ClientPortalUser',
      _id: v.userId
    }));
  }
};

export default ForumComment;
