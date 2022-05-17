import {
  attachmentInput,
  attachmentType
} from '@erxes/api-utils/src/commonTypeDefs';

export const types = `
  ${attachmentType}
  ${attachmentInput}

  type FlowCategory @key(fields: "_id") @cacheControl(maxAge: 3) {
    _id: String,
    createdAt: Date,
    name: String,
    code: String,
    order: String,
    description?: String,
    parentId?: String,
    attachment?: Attachment,
    status?: String,
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
  productCategoriesAdd(${flowCategoryParams}): FlowCategory
  productCategoriesEdit(_id: String!, ${flowCategoryParams}): FlowCategory
  productCategoriesRemove(_id: String!): JSON
`;
