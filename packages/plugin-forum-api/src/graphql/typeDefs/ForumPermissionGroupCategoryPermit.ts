export default `
    type ForumPermissionGroupCategoryPermit {
        _id: ID!
        categoryId: ID!
        category: ForumCategory!

        permissionGroupId: ID!
        permissionGroup: ForumPermissionGroup!

        permission: ForumPermission!
    }
`;
