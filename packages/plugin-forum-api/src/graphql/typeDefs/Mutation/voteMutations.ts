const voteMutations = `
  forumUpVotePostCp(postId: ID!): Boolean
  forumDownVotePostCp(postId: ID!): Boolean

  forumUpVoteCommentCp(commentId: ID!): Boolean
  forumDownVoteCommentCp(commentId: ID!): Boolean
`;

export default voteMutations;
