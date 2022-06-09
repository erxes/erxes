export const types = `
  extend type Branch @key(fields: "_id") {
    _id: String! @external
  }

  extend type Department @key(fields: "_id") {
    _id: String! @external
  }

  type SafeRemainder @key(fields: "_id") {
    _id: String!
    createdAt: Date
    createdBy: String
    modifiedAt: Date
    modifiedBy: String
    date: Date
    description: String
    status: String
    branchId: String
    departmentId: String

    branch: Branch
    department: Department
  }

  type SafeRemainders {
    remainders: [SafeRemainder],
    totalCount: Float,
  }
`;

export const queries = `
  safeRemainders(beginDate: Date, endDate: Date, productId: String, searchValue: String, page: Int, perPage: Int, sortField: String, sortDirection: Int, departmentId: String, branchId: String): SafeRemainders
`;
