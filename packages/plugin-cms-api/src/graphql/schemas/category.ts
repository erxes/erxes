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

    }

`;

export const queries = `
    cmsCategories(searchValue: String, status: CategoryStatus, page: Int, perPage: Int, sortField: String, sortDirection: SortDirection): [PostCategory]
    cmsCategory(_id: String!): PostCategory
`;

export const mutations = `
    cmsCategoriesAdd(input: PostCategoryInput!): PostCategory
    cmsCategoriesEdit(_id: String!, input: PostCategoryInput!): PostCategory
    cmsCategoriesRemove(_id: String!): JSON
    cmsCategorysToggleStatus(_id: String!): PostCategory
`;
