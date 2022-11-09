const followMutations = `
  forumFollowCpUser(cpUserId: String!): Boolean
  forumUnfollowCpUser(cpUserId: String!): Boolean
`;

export default followMutations;
