export default `
    type ForumPermissionGroupCategoryPermit {
        categoryId: ID!
        category: ForumCategory!

        permissionGroupId: ID!
        permissionGroup: ForumPermissionGroup!

        permission: ForumPermission!
    }
`;
