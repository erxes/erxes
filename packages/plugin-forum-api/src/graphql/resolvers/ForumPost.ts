import { IContext } from '..';
import { IObjectTypeResolver } from '@graphql-tools/utils';
import { IPost } from '../../db/models/post';

const ForumPost: IObjectTypeResolver<IPost, IContext> = {
  __resolveReference({ _id }, { models: { Post } }: IContext) {
    return Post.findById({ _id });
  },
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
  async commentCount({ _id, commentCount }, _, { models: { Comment } }) {
    return commentCount || 0;
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
    return PollOption.find({ postId: _id })
      .sort({ order: 1 })
      .lean();
  },

  async pollVoteCount({ _id }, _, { models: { PollVote, PollOption } }) {
    const pollOptions = await PollOption.find({ postId: _id })
      .select('_id')
      .lean();
    const pollOptionIds = pollOptions.map(o => o._id);
    return PollVote.countDocuments({ pollOptionId: { $in: pollOptionIds } });
  },

  async hasCurrentUserSavedIt({ _id }, _, { models: { SavedPost }, cpUser }) {
    if (!cpUser) {
      return false;
    }

    const savedPost = await SavedPost.findOne({
      cpUserId: cpUser.userId,
      postId: _id
    });

    return !!savedPost;
  },

  async quizzes({ _id }, _, { models: { Quiz }, user }) {
    const query: any = { postId: _id };

    if (!user) {
      query.state = 'PUBLISHED';
    }

    return Quiz.find(query);
  }
};

export default ForumPost;
