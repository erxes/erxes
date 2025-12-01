export const types = `
  type TemplateVariable {
    name: String
    required: Boolean
    description: String
  }

  type Template {
    _id: String!
    name: String!
    content: String
    contentType: String
    description: String
    pluginType: String
    categoryIds: [String]
    status: String
    createdBy: String
    createdAt: Date
    updatedBy: String
    updatedAt: Date
    cursor: String
  }

  type TemplateCategory {
    _id: String!
    name: String!
    order: String
    code: String!
    parentId: String
    contentType: String!
    status: String
    createdAt: Date
    updatedAt: Date
  }

  type TemplateListResponse {
    list: [Template]
    pageInfo: PageInfo
    totalCount: Int
  }

  type TemplateCategoryListResponse {
    list: [TemplateCategory]
    pageInfo: PageInfo
    totalCount: Int
  }
`;

export const inputs = `
  input TemplateVariableInput {
    name: String
    required: Boolean
    description: String
  }

  input TemplateInput {
    name: String!
    content: String
    contentType: String
    description: String
    pluginType: String
    categoryIds: [String]
    status: String
  }

  input TemplateEditInput {
    name: String
    content: String
    contentType: String
    description: String
    pluginType: String
    categoryIds: [String]
    status: String
  }
`;

export const queries = `
  templatesGetTypes: [JSON]
  templateList(searchValue: String, categoryIds: [String], page: Int, perPage: Int, limit: Int, cursor: String, contentType: String, status: String): TemplateListResponse
  templateDetail(_id: String!): Template
  categoryList(type: String): TemplateCategoryListResponse
`;

export const mutations = `
  templateAdd(doc: TemplateInput!): Template
  templateEdit(_id: String!, doc: TemplateEditInput!): Template
  templateRemove(_id: String!): Template
  templateUse(_id: String!, contentType: String, relTypeId: String): JSON
  templateSaveFrom(sourceId: String!, contentType: String!, name: String!, description: String, status: String): JSON
`;
