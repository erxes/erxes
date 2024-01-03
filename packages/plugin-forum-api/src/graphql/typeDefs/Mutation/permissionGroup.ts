const permissionGroupMutations = `
    forumPermissionGroupCreate(name: String!): ForumPermissionGroup
    forumPermissionGroupPatch(_id: ID!, name: String): ForumPermissionGroup
    forumPermissionGroupDelete(_id: ID!): ForumPermissionGroup

    forumPermissionGroupAddUsers(_id: ID!, cpUserIds: [ID!]!): Boolean
    forumPermissionGroupRemoveUser(_id: ID!, cpUserId: ID!): Boolean
    forumPermissionGroupSetUsers(_id: ID!, cpUserIds: [ID!]): Boolean

    forumPermissionGroupAddCategoryPermit(_id: ID!, categoryIds: [ID!]!, permission: ForumPermission!): Boolean
    forumPermissionGroupRemoveCategoryPermit(_id: ID!, categoryIds: [ID!]!, permission: ForumPermission!): Boolean
`;

export default permissionGroupMutations;
