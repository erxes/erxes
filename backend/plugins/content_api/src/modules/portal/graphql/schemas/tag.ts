import { GQL_CURSOR_PARAM_DEFS } from 'erxes-api-shared/utils';

export const types = `
    type PostTag {
        _id: String!
        clientPortalId: String!
        name: String
        slug: String
        colorCode: String
        createdAt: Date
        updatedAt: Date
    }

    type PostTagList {
        tags: [PostTag]
        totalCount: Int
        pageInfo: PageInfo
    }
`;

export const inputs = `

    input PostTagInput {
        name: String
        slug: String
        colorCode: String
        clientPortalId: String
    }

`;

export const queries = `
    cmsTags(clientPortalId: String, language: String, searchValue: String, sortField: String, sortDirection: String, ${GQL_CURSOR_PARAM_DEFS}): PostTagList
    cmsTag(_id: String, slug: String, language: String): PostTag
`;

export const mutations = `
    cmsTagsAdd(input: PostTagInput!): PostTag
    cmsTagsEdit(_id: String!, input: PostTagInput!): PostTag
    cmsTagsRemove(_id: String!): JSON
`;
