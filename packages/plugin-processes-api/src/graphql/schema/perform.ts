export const types = contactsAvailable => `

  type Perform @key(fields: "_id") @cacheControl(maxAge: 3) {
    _id: String

    overallWorkId: String
    overallWorkKey: OverallWorkKey
    type: String
    typeId: String
    status: String
    startAt: Date
    dueDate: Date
    endAt: Date
    count: Float
    description: String
    appendix: String
    assignedUserIds: [String]
    customerId: String
    companyId: String
    inBranchId: String
    inDepartmentId: String
    outBranchId: String
    outDepartmentId: String
    needProducts: JSON
    resultProducts: JSON
    inProducts: JSON
    outProducts: JSON
    inProductsLen: Int
    outProductsLen: Int

    inBranch: Branch
    inDepartment: Department
    outBranch: Branch
    outDepartment: Department

    ${
      contactsAvailable
        ? `
          company: Company
          customer: Customer
        `
        : ''
    }

    createdAt: Date
    createdBy: String
    modifiedAt: Date
    modifiedBy: String
    createdUser: User
    modifiedUser: User
    series: String
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
  status: String
  startDate: Date
  endDate: Date
  inBranchId: String
  outBranchId: String
  inDepartmentId: String
  outDepartmentId: String
  productCategoryId: String
  productIds: [String]
  jobCategoryId: String
  jobReferId: String
`;

export const queries = `
  performs(${paginateParams}, ${qryParams}): [Perform]
  performDetail(_id: String): Perform
  performsCount(${qryParams}): Int
  series(search: String, productId: String, ids: [String], excludeIds: Boolean, page: Int, perPage: Int): [JSON]
`;

const performParams = `
  overallWorkId: String
  overallWorkKey: JSON
  status: String
  startAt: Date
  dueDate: Date
  endAt: Date
  count: Float
  description: String
  appendix: String
  assignedUserIds: [String]
  customerId: String
  companyId: String
  inBranchId: String
  inDepartmentId: String
  outBranchId: String
  outDepartmentId: String
  needProducts: JSON
  resultProducts: JSON
  inProducts: JSON
  outProducts: JSON
`;

export const mutations = `
  performAdd(${performParams}): Perform
  performEdit(_id: String!, ${performParams}): Perform
  performChange(_id: String!, ${performParams}): Perform
  performRemove(_id: String!): JSON
  performConfirm(_id: String!, endAt: Date): Perform
  performAbort(_id: String!): Perform
`;
