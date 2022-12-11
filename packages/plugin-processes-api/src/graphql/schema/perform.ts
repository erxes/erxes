export const types = `

  type Perform @key(fields: "_id") @cacheControl(maxAge: 3) {
    _id: String,
    overallWorkId: String,
    overallWorkKey: OverallWorkKey,
    createdAt: Date,
    createdBy: String,
    updatedAt: Date,
    updatedBy: String,
    dueDate: Date,
    startAt: Date,
    endAt: Date,
    overallWork: JSON,
    status: String,
    productId: String,
    count: String,
    needProducts: JSON,
    resultProducts: JSON,
    needConfirmInfo: JSON,
    resultConfirmInfo: JSON,
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
  performs(${paginateParams}, ${qryParams}): [Perform]
  performsByOverallWorkId(overallWorkId: String, ${qryParams}):  [Perform]
  performsByOverallWorkIdTotalCount(overallWorkId: String, ${qryParams}): Int
  performsCount(${qryParams}): Int
`;

const performParams = `
  startAt: Date,
  endAt: Date,
  dueDate: Date,
  overallWorkId: String,
  status: String,
  productId: String,
  count: String,
  needProducts: [JobProductsInput],
  resultProducts: [JobProductsInput]
`;

export const mutations = `
  performsAdd(${performParams}): Perform
`;
