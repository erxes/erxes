export const types = `
  input CompanyListParams {
    limit: Int,
    page: String,
    segment: String,
    ids: [String]
  }

  type Company {
    _id: String!
    name: String
    size: Int
    website: String
    industry: String
    plan: String
    lastSeenAt: Date
    sessionCount: Int
    tagIds: [String],

    customFieldsData: JSON

    customers: [Customer]
  }
`;

export const queries = `
  companies(params: CompanyListParams): [Company]
  companyCounts(params: CompanyListParams): JSON
  companyDetail(_id: String!): Company
  companyActivityLog(_id: String!): [ActivityLogForMonth]
`;

const commonFields = `
  name: String!,
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
`;
