import { IContext } from '../..';
import { IObjectTypeResolver } from '@graphql-tools/utils';
// forumPatchPost(_id: ID!, categoryId: ID, content: String, thumbnail: String): ForumPost
const commentMutations: IObjectTypeResolver<any, IContext> = {
  async forumCreateComment(_, args, { models: { Comment } }) {
    return await Comment.create(args);
  },
  async forumUpdateComment(_, { _id, content }, { models: { Comment } }) {
    return await Comment.updateComment(_id, content);
  },
  async forumDeleteComment(_, { _id }, { models: { Comment } }) {
    return await Comment.deleteComment(_id);
  }
};

export default commentMutations;
