export default `
  type ForumPermissionGroup {
    _id: ID!
    name: String!

    users: [ClientPortalUser]

    permissionGroupCategoryPermits: [ForumPermissionGroupCategoryPermit!]
  }
`;
