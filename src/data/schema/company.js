export const types = `
  type Company {
    _id: String!
    name: String
    size: Int
    website: String
    industry: String
    plan: String

    parentCompanyId: String
    email: String
    ownerId: String
    phone: String
    leadStatus: String
    lifecycleState: String
    businessType: String
    description: String
    employees: Int
    doNotDisturb: String
    links: CompanyLinks
    owner: User
    parentCompany: Company

    lastSeenAt: Date
    sessionCount: Int
    tagIds: [String]

    customFieldsData: JSON

    customers: [Customer]
    deals: [Deal]
    getTags: [Tag]
  }

  type CompaniesListResponse {
    list: [Company],
    totalCount: Float,
  }

  type CompanyLinks {
    linkedIn: String
    twitter: String
    facebook: String
    github: String
    youtube: String
    website: String
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

  parentCompanyId: String,
  email: String,
  ownerId: String,
  phone: String,
  leadStatus: String,
  lifecycleState: String,
  businessType: String,
  description: String,
  employees: Int,
  doNotDisturb: String,
  links: JSON,

  lastSeenAt: Date,
  sessionCount: Int,
  tagIds: [String]
  customFieldsData: JSON
`;

export const mutations = `
  companiesAdd(${commonFields}): Company
  companiesEdit(_id: String!, ${commonFields}): Company

  companiesAddCustomer(
    _id: String!
    firstName: String
    lastName: String
    email: String!
  ): Customer

  companiesEditCustomers(_id: String!, customerIds: [String]): Company
  companiesRemove(companyIds: [String]): [String]
  companiesMerge(companyIds: [String], companyFields: JSON) : Company
`;
