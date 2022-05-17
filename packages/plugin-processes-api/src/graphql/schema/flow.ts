import {
  attachmentInput,
  attachmentType
} from '@erxes/api-utils/src/commonTypeDefs';

export const types = `
  ${attachmentType}
  ${attachmentInput}

  type Flow @key(fields: "_id") @cacheControl(maxAge: 3) {
    _id: String,
    createdAt: Date,
    createdBy: String,
    updatedAt: Date,
    updatedBy: String,
    name: String,
    categoryId: String,
    status: String,
    jobs: IJob[],
  }

  input JobInput {
    id: String,
    nextJobIds: String[],
    jobRefer: IJobRefer,
    style: Object,
    label: String,
    description: String,
    quantity: number,
  }
`;

const qryParams = `
  categoryId: String,
  searchValue: String,
  excludeIds: Boolean
`;

export const queries = `
  flows(page: Int, perPage: Int ids: [String], ${qryParams}): [Flow]
  flowTotalCount(${qryParams}): Int
  flowDetail(_id: String!): Flow
`;

const flowParams = `
  name: String,
  categoryId: String,
  status: String,
  jobs: JobInput,
`;

export const mutations = `
  productReferAdd(${flowParams}): Flow
  productReferEdit(_id: String!, ${flowParams}): Flow
  productReferRemove(_id: String!): JSON
`;
