export const types = `
    enum CategoryStatus {
        active
        inactive
    }

    enum SortDirection {
        asc
        desc
    }

    type PostCategory {
        _id: String!
        clientPortalId: String!
        name: String
        slug: String
        description: String
        parentId: String
        status: CategoryStatus
        parent: PostCategory
        createdAt: Date
        updatedAt: Date
    }
`;

export const inputs = `

    input PostCategoryInput {
        name: String
        slug: String
        description: String
        parentId: String
        status: String
        clientPortalId: String
    }

`;

export const queries = `
    cmsCategories(clientPortalId: String, searchValue: String, status: CategoryStatus, page: Int, perPage: Int, sortField: String, sortDirection: SortDirection): [PostCategory]
    cmsCategory(_id: String, slug: String): PostCategory
`;

export const mutations = `
    cmsCategoriesAdd(input: PostCategoryInput!): PostCategory
    cmsCategoriesEdit(_id: String!, input: PostCategoryInput!): PostCategory
    cmsCategoriesRemove(_id: String!): JSON
    cmsCategoriesToggleStatus(_id: String!): PostCategory
`;
