import { IContext } from '../..';
import { IObjectTypeResolver } from '@graphql-tools/utils';
import { moduleRequireLogin } from '@erxes/api-utils/src/permissions';

const crmCommentMutations: IObjectTypeResolver<any, IContext> = {
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

moduleRequireLogin(crmCommentMutations);

const cpCommentMutations: IObjectTypeResolver<any, IContext> = {
  async forumCreateCommentCp(_, args, { models: { Comment }, cpUser }) {
    return Comment.createCommentCp(args, cpUser);
  },
  async forumUpdateCommentCp(
    _,
    { _id, content },
    { models: { Comment }, cpUser }
  ) {
    return await Comment.updateCommentCp(_id, content, cpUser);
  },
  async forumDeleteCommentCp(_, { _id }, { models: { Comment }, cpUser }) {
    return await Comment.deleteCommentCp(_id, cpUser);
  }
};

export default { ...crmCommentMutations, ...cpCommentMutations };
