export const types = `
    type PageItem {
        type: String
        content: String
        order: Int
        contentType: String
        contentTypeId: String
        config: JSON
    }

    type Page {
        _id: String!
        clientPortalId: String
        name: String
        type: String
        slug: String
        content: String
        createdUserId: String
        createdUser: User
        createdAt: Date
        updatedAt: Date
        pageItems: [PageItem]
    }


    type PageList {
        pages: [Page]
        totalCount: Int
        totalPages: Int
        currentPage: Int
    }
`


export const inputs = `
    input PageItemInput {
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
        status: String
        type: String
        slug: String
        content: String
        pageItems: [PageItemInput]
    }
`

export const queries = `
    cmsPage(_id: String): Page
    cmsPages(clientPortalId: String!, page: Int, perPage: Int): [Page]
    cmsPageList(clientPortalId: String!, page: Int, perPage: Int): PageList
`   


export const mutations = `
    cmsPagesAdd(input: PageInput!): Page
    cmsPagesEdit(_id: String!, input: PageInput!): Page
    cmsPagesRemove(_id: String!): JSON
`