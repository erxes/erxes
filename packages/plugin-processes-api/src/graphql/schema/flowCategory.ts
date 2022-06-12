export const types = `

  type FlowCategory @key(fields: "_id") @cacheControl(maxAge: 3) {
    _id: String,
    createdAt: Date,
    name: String,
    code: String,
    order: String,
    description: String,
    parentId: String,
    attachment: Attachment,
    status: String,
    flowCount: Int
  }
`;

export const queries = `
  flowCategories(parentId: String, searchValue: String, status: String): [FlowCategory]
  flowCategoriesTotalCount: Int
  flowCategoryDetail(_id: String!): FlowCategory
`;

const flowCategoryParams = `
  name: String!,
  code: String!,
  description: String,
  parentId: String,
  attachment: AttachmentInput,
  status: String,
`;

export const mutations = `
  flowCategoriesAdd(${flowCategoryParams}): FlowCategory
  flowCategoriesEdit(_id: String!, ${flowCategoryParams}): FlowCategory
  flowCategoriesRemove(_id: String!): JSON
`;
