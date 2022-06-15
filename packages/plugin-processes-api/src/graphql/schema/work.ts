export const types = `

  type Work @key(fields: "_id") @cacheControl(maxAge: 3) {
    _id: String,
    createdAt: Date,
    createdBy: String,
    updatedAt: Date,
    updatedBy: String,
    name: String,
    status: String,
    jobId: String,
    flowId: String,
    productId: String,
    count: String,
    branchId: String,
    departmentId: String
  }
`;

const qryParams = `
  searchValue: String
`;

export const queries = `
  works(page: Int, perPage: Int, ${qryParams}): [Work]
  workTotalCount(${qryParams}): Int
  workDetail(_id: String!): Work
`;

const workParams = `
name: String,
status: String,
jobId: String,
flowId: String,
productId: String,
count: String,
branchId: String,
departmentId: String
`;

export const mutations = `
  flowsAdd(${workParams}): Work
  flowsEdit(_id: String!, ${workParams}): Work
  flowsRemove(workIds: [String!]): JSON
`;
