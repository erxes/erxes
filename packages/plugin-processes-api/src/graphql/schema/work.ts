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
    jobId: String,
    job: JSON,
    flowId: String,
    flow: JSON,
    productId: String,
    product: JSON,
    count: String,
    intervalId: String,
    interval: JSON,
    inBranchId: String,
    inBranch: String
    inDepartmentId: String,
    inDepartment: String
    outBranchId: String,
    outBranch: String,
    outDepartmentId: String,
    outDepartment: String
    needProducts: JSON,
    resultProducts: JSON
  }
`;

const qryParams = `
  searchValue: String
`;

export const queries = `
  works(page: Int, perPage: Int, ${qryParams}): [Work]
  workTotalCount(${qryParams}): Int
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
