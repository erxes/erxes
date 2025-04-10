export const types = `
    enum CategoryStatus {
        active
        inactive
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

        customFieldsData: JSON

        customFieldsMap: JSON
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
        customFieldsData: JSON
    }

`;

export const queries = `
    cmsCategories(clientPortalId: String, searchValue: String, status: CategoryStatus, page: Int, perPage: Int, sortField: String, sortDirection: String): [PostCategory]
    cmsCategory(_id: String, slug: String): PostCategory
`;

export const mutations = `
    cmsCategoriesAdd(input: PostCategoryInput!): PostCategory
    cmsCategoriesEdit(_id: String!, input: PostCategoryInput!): PostCategory
    cmsCategoriesRemove(_id: String!): JSON
    cmsCategoriesToggleStatus(_id: String!): PostCategory
`;
