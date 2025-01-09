export const types = `

    extend type User @key(fields: "_id") {
        _id: String! @external
    }

    type Template {
        _id: String!
        name: String
        description: String
        contentType: String
        content: String

        categories: [Category]

        createdAt:Date
        createdBy: User

        updatedAt:Date
        updatedBy: User
    }

    type TemplateListResponse {
        list: [Template]
        totalCount: Int
    }

    type Category {
        _id: String!
        name: String
        parentId: String
        order: String
        code: String
        contentType: String

        templateCount: Int
        isRoot: Boolean

        createdAt:Date
        createdBy: User

        updatedAt:Date
        updatedBy: User
    }

    type TemplateCategoryListResponse {
        list: [Category]
        totalCount: Int
    }
`;

export const queries = `
    templatesGetTypes: [JSON]
    templateList(searchValue: String, categoryIds: [String], page: Int, perPage: Int, contentType: String): TemplateListResponse
    templateDetail(_id: String!): Template

    categoryList(type: String): TemplateCategoryListResponse
    `;

// templatePreview(serviceName: String!, contentType: String!, contentId: String!): JSON
const templateParams = `
    name: String,
    description: String,
    content: String,
    contentType: String,
    categoryIds: [String]
`;

const categoryParams = `
    name: String,
    parentId: String,
    code: String,
    contentType: String
`;

export const mutations = `
    templateAdd(${templateParams}): Template
    templateEdit(_id: String!, ${templateParams}): Template
    templateRemove(_id: String!): JSON

    templateUse(_id: String!): JSON

    categoryAdd(${categoryParams}): Category
    categoryEdit(_id: String!, ${categoryParams}): Category
    categoryRemove(_id: String!): JSON
`;