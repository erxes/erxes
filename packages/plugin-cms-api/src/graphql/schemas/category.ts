export const types = `
    type PostCategory {
        _id: String!
        name: String
        slug: String
        description: String
        parentId: String
        status: String
        parent: PostCategory
        createdAt: Date
        updatedAt: Date
    }
`

export const inputs = `

    input PostCategoryInput {
        name: String
        slug: String
        description: String
        parentId: String
        status: String
    }

`

export const queries = `
    cmsCategories(searchValue: String, status: String, page: Int, perPage: Int): [PostCategory]
    cmsCategory(id: String!): PostCategory
`

export const mutations = `
    cmsCategoriesAdd(input: PostCategoryInput!): PostCategory
    cmsCategoriesEdit(id: String!, input: PostCategoryInput!): PostCategory
    cmsCategoriesRemove(id: String!): JSON
`
