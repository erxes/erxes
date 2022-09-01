import { IContext } from '../..';
import { IObjectTypeResolver } from '@graphql-tools/utils';

// forumPatchPost(_id: ID!, categoryId: ID, content: String, thumbnail: String): ForumPost
const commentMutations: IObjectTypeResolver<any, IContext> = {
  async forumCreateComment(_, args, { models: { Comment }, user }) {
    return Comment.createComment(args, user);
  },
  async forumUpdateComment(_, { _id, content }, { models: { Comment }, user }) {
    return await Comment.updateComment(_id, content, user);
  },
  async forumDeleteComment(_, { _id }, { models: { Comment } }) {
    return await Comment.deleteComment(_id);
  }
};

export default commentMutations;
