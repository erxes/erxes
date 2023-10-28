const commontTypes = `
  _id: String
  key: OverallWorkKey
  workIds: [String]
  type: String
  jobRefer: JobRefer
  product: Product
  count: Float
  needProducts: JSON
  resultProducts: JSON

  inDepartment: Department
  inBranch: Branch
  outDepartment: Department
  outBranch: Branch
`;

export const types = `
  type OverallWorkKey {
    inBranchId: String
    inDepartmentId: String
    outBranchId: String
    outDepartmentId: String
    type: String
    typeId: String
  }

  type OverallWork @key(fields: "_id") @cacheControl(maxAge: 3) {
    ${commontTypes}
  }

  type OverallWorkDetail @key(fields: "_id") @cacheControl(maxAge: 3) {
    ${commontTypes}
    startAt: Date
    dueDate: Date
    interval: JSON
    intervalId: String
    needProductsData: JSON
    resultProductsData: JSON
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
  productIds: [String]
  vendorIds: [String]
  jobCategoryId: String
  jobReferId: String
`;

const detailParamsDef = `
  startDate: Date
  endDate: Date
  type: String
  productCategoryId: String
  productIds: [String]
  jobReferId: String
  inBranchId: String
  outBranchId: String
  inDepartmentId: String
  outDepartmentId: String
`;

export const queries = `
  overallWorks(${qryParams}, ${paginateParams}): [OverallWork]
  overallWorksCount(${qryParams}): Int
  overallWorkDetail(${detailParamsDef}): OverallWorkDetail
`;

export const mutations = `
`;
