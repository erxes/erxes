const commentMutations = `
  forumCreateComment(postId: ID!, replyToId: ID, content: String!): ForumComment!
  forumUpdateComment(_id: ID!, content: String): ForumComment!
  forumDeleteComment(_id: ID!): ForumComment

  forumCreateCommentCp(postId: ID!, replyToId: ID, content: String!): ForumComment!
  forumUpdateCommentCp(_id: ID!, content: String): ForumComment!
  forumDeleteCommentCp(_id: ID!): ForumComment
`;

export default commentMutations;
