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
    job: JSON,
    flowId: String,
    flow: JSON,
    intervalId: String,
    interval: JSON,
    outBranchId: String,
    outBranch: String,
    outDepartmentId: String,
    outDepartment: String,
    inBranchId: String,
    inBranch: String,
    inDepartmentId: String,
    inDepartment: String,
    needProducts: JSON,
    resultProducts: JSON
  }
`;

const qryParams = `
  searchValue: String,
  inBranchId: String,
  inDepartmentId: String,
  outBranchId: String,
  outDepartmentId: String
`;

export const queries = `
  overallWorks(page: Int, perPage: Int, ${qryParams}): [OverallWork]
  overallWorksSideBar(${qryParams}): [OverallWork]
  overallWorksTotalCount(${qryParams}): Int
`;

const workParams = `
  status: String,
  dueDate: Date,
  startAt: Date,
  endAt: Date,
  assignUserIds: [String]
  jobId: String,
  flowId: String,
  intervalId: String,
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
