export const types = `
    type PageItem {
        _id: String
        name: String
        type: String
        content: String
        order: Int
        contentType: String
        contentTypeId: String
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
        totalPages: Int
        currentPage: Int
    }
`;

export const inputs = `
    input PageItemInput {
        name: String
        type: String
        content: String
        order: Int
        contentType: String
        contentTypeId: String
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
    cmsPage(_id: String, slug: String): Page
    cmsPages(clientPortalId: String, page: Int, perPage: Int, searchValue: String): [Page]
    cmsPageList(clientPortalId: String, page: Int, perPage: Int, searchValue: String): PageList
`;

export const mutations = `
    cmsPagesAdd(input: PageInput!): Page
    cmsPagesEdit(_id: String!, input: PageInput!): Page
    cmsPagesRemove(_id: String!): JSON
`;
