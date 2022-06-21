export const types = `
  type OverallWork @key(fields: "_id") @cacheControl(maxAge: 3) {
    _id: String,
    createdAt: Date,
    createdBy: String,
    updatedAt: Date,
    updatedBy: String,
    status: String,
    dueDate: Date,
    startAt: Date,
    endAt: Date,
    assignUserIds: JSON
    jobId: String,
    flowId: String,
    outBranchId: String,
    outDepartmentId: String,
    inBranchId: String,
    inDepartmentId: String,
    needProducts: JSON,
    resultProducts: JSON
  }
`;

const qryParams = `
  searchValue: String
`;

export const queries = `
  overallWorks(page: Int, perPage: Int, ${qryParams}): [OverallWork]
  overallWorkTotalCount(${qryParams}): Int
`;

const workParams = `
  status: String,
  dueDate: Date,
  startAt: Date,
  endAt: Date,
  assignUserIds: [String]
  jobId: String,
  flowId: String,
  outBranchId: String,
  outDepartmentId: String,
  inBranchId: String,
  inDepartmentId: String,
  needProducts: [JobProductsInput],
  resultProducts: [JobProductsInput]
`;

export const mutations = `
  overallWorksAdd(${workParams}): OverallWork
`;
