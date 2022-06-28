import {
  attachmentInput,
  attachmentType
} from '@erxes/api-utils/src/commonTypeDefs';

export const types = `
  ${attachmentType}
  ${attachmentInput}

  type JobRefer @key(fields: "_id") @cacheControl(maxAge: 3) {
    _id: String,
    createdAt: Date,
    code: String,
    name: String,
    categoryId: String,
    type: String,
    status: String,
    duration: Float,
    durationType: String,
    needProducts: JSON,
    resultProducts: JSON,
  }

  input JobProductsInput {
    _id: String,
    productId: String,
    product: JSON,
    quantity: Float,
    uomId: String,
    uom: JSON,
    branchId: String,
    departmentId: String,
  }
`;

const qryParams = `
  categoryId: String,
  searchValue: String,
  ids: String,
  excludeIds: Boolean
`;

export const queries = `
  jobRefers(page: Int, perPage: Int ids: [String], ${qryParams}): [JobRefer]
  jobReferTotalCount(${qryParams}): Int
  jobReferDetail(_id: String!): JobRefer

  jobRefersAll: [JobRefer]
`;

const jobReferParams = `
  code: String,
  name: String,
  categoryId: String,
  type: String,
  status: String,
  createdAt: Date,
  duration: Float,
  durationType: String,
  needProducts: [JobProductsInput],
  resultProducts: [JobProductsInput],
`;

export const mutations = `
  jobRefersAdd(${jobReferParams}): JobRefer
  jobRefersEdit(_id: String!, ${jobReferParams}): JobRefer
  jobRefersRemove(jobRefersIds: [String!]): JSON
`;
