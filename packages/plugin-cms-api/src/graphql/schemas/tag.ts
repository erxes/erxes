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
    cmsTags(clientPortalId: String, searchValue: String, page: Int, perPage: Int, sortField: String, sortDirection: String, language: String): [PostTag]
    cmsTagsCount(clientPortalId: String, searchValue: String): Int
    cmsTag(_id: String, slug: String, language: String): PostTag
`;

export const mutations = `
    cmsTagsAdd(input: PostTagInput!): PostTag
    cmsTagsEdit(_id: String!, input: PostTagInput!): PostTag
    cmsTagsRemove(_id: String!): JSON
`;
