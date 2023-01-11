const savedPostMutations = `
    forumCpPostSave(postId: ID!): ForumSavedPost
    forumCpPostUnsave(postId: ID!): ForumSavedPost
    forumCpSavedPostDelete(postId: ID!): ForumSavedPost
`;

export default savedPostMutations;
