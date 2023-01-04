import { IContext } from '..';
import { IObjectTypeResolver } from '@graphql-tools/utils';
import { IPost } from '../../db/models/post';

const ForumPost: IObjectTypeResolver<IPost, IContext> = {
  async category({ categoryId }, _, { models: { Category } }) {
    return categoryId && Category.findById(categoryId);
  },
  async createdBy({ createdById }) {
    return createdById && { __typename: 'User', _id: createdById };
  },
  async updatedBy({ updatedById }) {
    return updatedById && { __typename: 'User', _id: updatedById };
  },
  async createdByCp({ createdByCpId }) {
    return (
      createdByCpId && { __typename: 'ClientPortalUser', _id: createdByCpId }
    );
  },
  async updatedByCp({ updatedByCpId }) {
    return (
      updatedByCpId && { __typename: 'ClientPortalUser', _id: updatedByCpId }
    );
  },
  async commentCount({ _id }, _, { models: { Comment } }) {
    return (await Comment.countDocuments({ postId: _id })) || 0;
  },

  async upVoteCount({ _id }, _, { models: { PostUpVote } }) {
    return PostUpVote.countDocuments({ contentId: _id });
  },
  async downVoteCount({ _id }, _, { models: { PostDownVote } }) {
    return PostDownVote.countDocuments({ contentId: _id });
  },

  async upVotes({ _id }, _, { models: { PostUpVote } }) {
    const upVotes = await PostUpVote.find({ contentId: _id }).lean();
    return upVotes.map(v => ({
      __typename: 'ClientPortalUser',
      _id: v.userId
    }));
  },
  async downVotes({ _id }, _, { models: { PostDownVote } }) {
    const downVotes = await PostDownVote.find({ contentId: _id }).lean();
    return downVotes.map(v => ({
      __typename: 'ClientPortalUser',
      _id: v.userId
    }));
  },

  async tags({ tagIds }) {
    return tagIds && tagIds.map(_id => ({ __typename: 'Tag', _id }));
  },

  async pollOptions({ _id }, _, { models: { PollOption } }) {
    return PollOption.find({ postId: _id }).lean();
  }
};

export default ForumPost;
