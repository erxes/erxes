export const types = contactsAvailable => `

  type Perform @key(fields: "_id") @cacheControl(maxAge: 3) {
    _id: String

    overallWorkId: String
    overallWorkKey: OverallWorkKey
    type: String
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
  jobCategoryId: String
  jobReferId: String
`;

export const queries = `
  performs(${paginateParams}, ${qryParams}): [Perform]
  performDetail(_id: String): Perform
  performsCount(${qryParams}): Int
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
`;
