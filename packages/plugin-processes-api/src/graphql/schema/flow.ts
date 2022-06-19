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
    flowJobStatus: Boolean,
    branchId: String,
    departmentId: String
  }

  input JobInput {
    id: String,
    nextJobIds: [String],
    jobReferId: String,
    style: JSON,
    label: String,
    description: String,
    quantity: Int,
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
  productId: String,
  status: String,
  flowJobStatus: Boolean,
  branchId: String,
  departmentId: String
  jobs: [JobInput],
`;

export const mutations = `
  flowsAdd(${flowParams}): Flow
  flowsEdit(_id: String!, ${flowParams}): Flow
  flowsRemove(flowIds: [String!]): JSON
`;
