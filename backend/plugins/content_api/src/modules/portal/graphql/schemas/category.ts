import { GQL_CURSOR_PARAM_DEFS } from 'erxes-api-shared/utils';

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

    type PostCategoryListResponse {
        list: [PostCategory]
        totalCount: Int
        pageInfo: PageInfo
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
    cmsCategories(clientPortalId: String, language: String, searchValue: String, status: CategoryStatus, ${GQL_CURSOR_PARAM_DEFS}, sortField: String, sortDirection: String): PostCategoryListResponse
    cmsCategory(_id: String, slug: String, language: String): PostCategory
`;

export const mutations = `
    cmsCategoriesAdd(input: PostCategoryInput!): PostCategory
    cmsCategoriesEdit(_id: String!, input: PostCategoryInput!): PostCategory
    cmsCategoriesRemove(_id: String!): JSON
    cmsCategoriesToggleStatus(_id: String!): PostCategory
`;
