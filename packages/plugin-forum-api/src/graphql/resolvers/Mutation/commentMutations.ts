import { IContext } from '../..';
import { IObjectTypeResolver } from '@graphql-tools/utils';

/*
  forumCreateCommentCp(postId: ID!, replyToId: ID, content: String!): ForumComment!
  forumUpdateCommentCp(_id: ID!, content: String): ForumComment!
  forumDeleteCommentCp(_id: ID!): ForumComment
  */

const commentMutations: IObjectTypeResolver<any, IContext> = {
  async forumCreateComment(_, args, { models: { Comment }, user }) {
    return Comment.createComment(args, user);
  },
  async forumUpdateComment(_, { _id, content }, { models: { Comment }, user }) {
    return await Comment.updateComment(_id, content, user);
  },
  async forumDeleteComment(_, { _id }, { models: { Comment } }) {
    return await Comment.deleteComment(_id);
  },
  /* <<< Client portal */
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
  /* >>> Client portal */
};

export default commentMutations;
