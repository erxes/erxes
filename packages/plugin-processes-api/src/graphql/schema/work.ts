export const types = `

  type Work @key(fields: "_id") @cacheControl(maxAge: 3) {
    _id: String,
    createdAt: Date,
    createdBy: String,
    updatedAt: Date,
    updatedBy: String,
    name: String,
    status: String,
    dueDate: Date,
    startAt: Date,
    endAt: Date,
    flowId: String,
    flow: JSON,
    count: String,
    intervalId: String,
    interval: JSON,
    inBranchId: String,
    inBranch: Branch
    inDepartmentId: String,
    inDepartment: Department,
    outBranchId: String,
    outBranch: Branch,
    outDepartmentId: String,
    outDepartment: Department,
    needProducts: JSON,
    resultProducts: JSON
  }
`;

const qryParams = `
  searchValue: String
`;

export const queries = `
  works(page: Int, perPage: Int, ${qryParams}): [Work]
  worksTotalCount(${qryParams}): Int
`;

const workParams = `
  name: String,
  status: String,
  dueDate: Date,
  startAt: Date,
  endAt: Date,
  jobId: String,
  flowId: String,
  productId: String,
  count: String,
  intervalId: String,
  inBranchId: String,
  inDepartmentId: String,
  outBranchId: String,
  outDepartmentId: String,
  needProducts: [JobProductsInput],
  resultProducts: [JobProductsInput]
`;

export const mutations = `
  worksAdd(${workParams}): Work
`;
