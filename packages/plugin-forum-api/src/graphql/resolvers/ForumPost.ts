import { IContext } from '..';
import { IObjectTypeResolver } from '@graphql-tools/utils';
import { IPost } from '../../db/models/post';

const ForumPost: IObjectTypeResolver<IPost, IContext> = {
  async category({ categoryId }, _, { models: { Category } }) {
    return Category.findById(categoryId).lean();
  },
  async createdBy({ createdById }) {
    return createdById && { __typename: 'User', _id: createdById };
  },
  async updatedBy({ updatedById }) {
    return updatedById && { __typename: 'User', _id: updatedById };
  },
  async stateChangedBy({ stateChangedById }) {
    return stateChangedById && { __typename: 'User', _id: stateChangedById };
  },
  async totalCommentCount({ _id }, _, { models: { Comment } }) {
    return Comment.find({ postId: _id }).countDocuments();
  }
};

export default ForumPost;
