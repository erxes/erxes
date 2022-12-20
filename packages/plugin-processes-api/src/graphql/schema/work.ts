export const types = `

  type Work @key(fields: "_id") @cacheControl(maxAge: 3) {
    _id: String,
    processId: String,
    name: String,
    status: String,
    dueDate: Date,
    startAt: Date,
    endAt: Date,
    type: String,
    typeId: String,
    flowId: String,
    origin: String,
    count: String,
    intervalId: String,
    inBranchId: String,
    inDepartmentId: String,
    outBranchId: String,
    outDepartmentId: String,
    needProducts: JSON,
    resultProducts: JSON
    
    createdAt: Date,
    createdBy: String,
    updatedAt: Date,
    updatedBy: String,

    flow: JSON,
    interval: JSON,
    inBranch: Branch
    inDepartment: Department,
    outBranch: Branch,
    outDepartment: Department,
    createdUser: User
    updatedUser: User    
  }
`;

const paginateParams = `
  page: Int
  perPage: Int
  sortField: String
  sortDirection: Int
`;

const qryParams = `
  search: String
  type: String
  startDate: Date
  endDate: Date
  inBranchId: String
  outBranchId: String
  inDepartmentId: String
  outDepartmentId: String
  productCategoryId: String
  productId: String
  jobCategoryId: String
  jobReferId: String
`;

export const queries = `
  works(${qryParams}, ${paginateParams}): [Work]
  worksTotalCount(${qryParams}): Int
`;

const workParams = `
  name: String,
  status: String,
  dueDate: Date,
  startAt: Date,
  endAt: Date,
  type: String,
  typeId: String,
  count: Float,
  inBranchId: String,
  inDepartmentId: String,
  outBranchId: String,
  outDepartmentId: String,
  needProducts: JSON,
  resultProducts: JSON,
`;

export const mutations = `
  workAdd(${workParams}): Work
  workEdit(_id: String!, ${workParams}): Work
  workRemove(_id: String!): JSON
`;
