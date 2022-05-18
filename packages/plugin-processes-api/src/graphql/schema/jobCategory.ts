export const types = `

  type JobCategory @key(fields: "_id") @cacheControl(maxAge: 3) {
    _id: String,
    createdAt: Date,
    name: String,
    code: String,
    order: String,
    description: String,
    parentId: String,
    attachment: Attachment,
    status: String,
  }
`;

export const queries = `
  jobCategories(parentId: String, searchValue: String, status: String): [JobCategory]
  jobCategoriesTotalCount: Int
  jobCategoryDetail(_id: String!): JobCategory
`;

const jobCategoryParams = `
  name: String!,
  code: String!,
  description: String,
  parentId: String,
  attachment: AttachmentInput,
  status: String,
`;

export const mutations = `
  jobCategoriesAdd(${jobCategoryParams}): JobCategory
  jobCategoriesEdit(_id: String!, ${jobCategoryParams}): JobCategory
  jobCategoriesRemove(_id: String!): JSON
`;
