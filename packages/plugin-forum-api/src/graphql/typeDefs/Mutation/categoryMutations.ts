const categoryMutations = `

  forumCreateCategory(
    parentId: String
    name: String!
    code: String
    thumbnail: String
  
    userLevelReqPostRead: String
    userLevelReqPostWrite: String
    userLevelReqCommentWrite: String
  
    postsRequireCrmApproval: Boolean
  ): ForumCategory

  forumPatchCategory(
    _id: ID!
    parentId: String
    name: String
    code: String
    thumbnail: String
  
    userLevelReqPostRead: String
    userLevelReqPostWrite: String
    userLevelReqCommentWrite: String
  
    postsRequireCrmApproval: Boolean
  ): ForumCategory

  forumDeleteCategory(_id: ID!): ForumCategory
`;

export default categoryMutations;
