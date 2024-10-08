export const types = `
    enum PageKind {
        main
        footer
    }

    type PageItem {
        type: String
        content: String
        order: Int
        contentType: String
        contentTypeId: String
    }

    type Page {
        _id: String!
        clientPortalId: String
        kind: PageKind
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

`


export const inputs = `
    input PageItemInput {
        type: String
        content: String
        order: Int
        contentType: String
        contentTypeId: String
    }

    input PageInput {
        name: String
        type: String
        slug: String
        content: String
        pageItems: [PageItemInput]
        kind: PageKind
    }
`

export const queries = `
    page(_id: String): Page
    pages(clientPortalId: String!, kind: PageKind, page: Int, perPage: Int): [Page]
`   


export const mutations = `
    pagesAdd(doc: PageInput!): Page
    pagesEdit(_id: String!, doc: PageInput!): Page
    pagesRemove(_id: String!): JSON
`