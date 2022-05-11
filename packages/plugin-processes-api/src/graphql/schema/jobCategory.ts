import {
  attachmentInput,
  attachmentType
} from '@erxes/api-utils/src/commonTypeDefs';

export const types = `
  ${attachmentType}
  ${attachmentInput}

  type JobCategory @key(fields: "_id") @cacheControl(maxAge: 3) {
    _id: String;
    createdAt: Date;
    name: String;
    code: String;
    order: String;
    description?: String;
    parentId?: String;
    attachment?: Attachment;
    status?: String;
  }
`;

export const queries = `
  jobCategories(parentId: String, searchValue: String, status: String): [JobCategory]
  jobCategoriesTotalCount: Int
  jobCategoryDetail(_id: String!): JobCategory
`;

const jobCategoryParams = `
  name: String!;
  code: String!;
  description: String;
  parentId: String;
  attachment: AttachmentInput,
  status: String;
`;

export const mutations = `
  productCategoriesAdd(${jobCategoryParams}): JobCategory
  productCategoriesEdit(_id: String!, ${jobCategoryParams}): JobCategory
  productCategoriesRemove(_id: String!): JSON
`;
