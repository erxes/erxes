export const types = `
  type Company {
    _id: String!
    name: String
    size: Int
    website: String
    industry: String
    plan: String
    lastSeenAt: Date
    sessionCount: Int
    tagIds: [String]

    customFieldsData: JSON

    customers: [Customer]
    getTags: [Tag]
  }

  type CompaniesListResponse {
    list: [Company],
    totalCount: Float,
  }
`;

const queryParams = `
  page: Int,
  perPage: Int,
  segment: String,
  tag: String,
  ids: [String],
  searchValue: String
`;

export const queries = `
  companiesMain(${queryParams}): CompaniesListResponse
  companies(${queryParams}): [Company]
  companyCounts(${queryParams}): JSON
  companyDetail(_id: String!): Company
`;

const commonFields = `
  name: String,
  size: Int,
  website: String,
  industry: String,
  plan: String,
  lastSeenAt: Date,
  sessionCount: Int,
  tagIds: [String]
  customFieldsData: JSON
`;

export const mutations = `
  companiesAdd(${commonFields}): Company
  companiesEdit(_id: String!, ${commonFields}): Company
  companiesAddCustomer(_id: String!, name: String!, email: String): Customer
  companiesEditCustomers(_id: String!, customerIds: [String]): Company
  companiesRemove(companyIds: [String]): [String]
  companiesMerge(companyIds: [String], companyFields: JSON) : Company
`;
