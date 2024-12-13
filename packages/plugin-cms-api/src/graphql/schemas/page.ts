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
    page(_id: String): Page
    pages(clientPortalId: String!, page: Int, perPage: Int): [Page]
    pageList(clientPortalId: String!, page: Int, perPage: Int): PageList
`   


export const mutations = `
    pagesAdd(input: PageInput!): Page
    pagesEdit(_id: String!, input: PageInput!): Page
    pagesRemove(_id: String!): JSON
`