const savedPostMutations = `
    forumCpPostSave(postId: ID!): ForumSavedPost
    forumCpPostUnsave(postId: ID!): ForumSavedPost
    forumCpSavedPostDelete(_id: ID!): ForumSavedPost
`;

export default savedPostMutations;
