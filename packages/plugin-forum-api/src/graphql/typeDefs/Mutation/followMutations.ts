const followMutations = `
  forumFollowCpUser(cpUserId: String!): Boolean
  forumUnfollowCpUser(cpUserId: String!): Boolean
  forumFollowTag(tagId: String!): Boolean
  forumUnfollowTag(tagId: String!): Boolean
`;

export default followMutations;
