export const types = `

  type Flow @key(fields: "_id") @cacheControl(maxAge: 3) {
    _id: String,
    createdAt: Date,
    createdBy: String,
    updatedAt: Date,
    updatedBy: String,
    name: String,
    categoryId: String,
    productId: String,
    product: JSON,
    status: String,
    jobs: JSON,
    jobCount: Int,
    flowValidation: String
  }

  input JobInput {
    id: String,
    type: String,
    nextJobIds: [String],
    style: JSON,
    label: String,
    description: String,
    config: JSON
  }
`;

const qryParams = `
  categoryId: String,
  searchValue: String,
  excludeIds: Boolean,
  ids: [String],
  branchId: String,
  departmentId: String,
  status: String,
  validation: String,
`;

export const queries = `
  flows(page: Int, perPage: Int, ${qryParams}): [Flow]
  flowsAll: [Flow]
  flowTotalCount(${qryParams}): Int
  flowDetail(_id: String!): Flow

  testGetReceiveDatas: JSON
`;

const flowParams = `
  name: String,
  categoryId: String,
  productId: String,
  status: String,
  flowValidation: String,
  jobs: [JobInput],
`;

export const mutations = `
  flowsAdd(${flowParams}): Flow
  flowsEdit(_id: String!, ${flowParams}): Flow
  flowsRemove(flowIds: [String!]): JSON
`;
