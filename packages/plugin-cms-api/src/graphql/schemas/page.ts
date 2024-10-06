export const types = `
    type PageItem {
        type: String
        content: String
        order: Int
        contentType: String
        contentTypeId: String
    }

    type Page {
        _id: String!
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
}
`


export const inputs = `
    input PageInput {
        name: String
        type: String
        slug: String
        content: String
    }
`

export const queries = `
    page(_id: String): Page
    pages(clientPortalId: String!, page: Int, perPage: Int): [Page]
`   


export const mutations = `
    pagesAdd(doc: PageInput!): Page
    pagesEdit(_id: String!, doc: PageInput!): Page
    pagesRemove(_id: String!): JSON
`