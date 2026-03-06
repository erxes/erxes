import { GQL_CURSOR_PARAM_DEFS } from 'erxes-api-shared/utils';

export const types = `
    type PageItem {
        _id: String!
        name: String
        type: String
        content: String
        order: Int
        objectType: String
        objectId: String
        config: JSON
    }

    type Page {
        _id: String!
        clientPortalId: String!
        name: String
        description: String
        coverImage: String
        type: String
        slug: String
        content: String
        status: String
        createdUserId: String
        createdUser: User
        createdAt: Date
        updatedAt: Date
        pageItems: [PageItem]

        customFieldsData: JSON

        customFieldsMap: JSON
    }


    type PageList {
        pages: [Page]
        totalCount: Int
        pageInfo: PageInfo
    }
`;

export const inputs = `
    input PageItemInput {
        name: String
        type: String
        content: String
        order: Int
        objectType: String
        objectId: String
        config: JSON

        
    }

    input PageInput {
        clientPortalId: String
        name: String
        description: String
        coverImage: String
        status: String
        type: String
        slug: String
        content: String
        pageItems: [PageItemInput]
        customFieldsData: JSON
    }
`;

export const queries = `
    cmsPage(_id: String, slug: String, language: String, clientPortalId: String): Page
    cmsPages(clientPortalId: String, searchValue: String, language: String, ${GQL_CURSOR_PARAM_DEFS}): [Page]
    cmsPageList(clientPortalId: String, searchValue: String, language: String, ${GQL_CURSOR_PARAM_DEFS}): PageList
    
    cpPages(language: String, clientPortalId: String): [Page]
`;

export const mutations = `
    cmsPagesAdd(input: PageInput!): Page
    cmsPagesEdit(_id: String!, input: PageInput!): Page
    cmsPagesRemove(_id: String!): JSON
`;
