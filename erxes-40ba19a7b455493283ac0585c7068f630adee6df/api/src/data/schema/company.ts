import { conformityQueryFields } from './common';

export const types = `
  type Company {
    _id: String!

    createdAt: Date
    modifiedAt: Date
    avatar: String

    size: Int
    website: String
    industry: String
    plan: String
    parentCompanyId: String
    ownerId: String
    mergedIds: [String]

    names: [String]
    primaryName: String
    emails: [String]
    primaryEmail: String
    phones: [String]
    primaryPhone: String

    businessType: String
    description: String
    doNotDisturb: String
    links: JSON
    owner: User
    parentCompany: Company

    tagIds: [String]

    customFieldsData: JSON

    customers: [Customer]
    getTags: [Tag]
    code: String
  }

  type CompaniesListResponse {
    list: [Company],
    totalCount: Float,
  }
`;

const queryParams = `
  page: Int
  perPage: Int
  segment: String
  tag: String
  ids: [String]
  excludeIds: Boolean
  searchValue: String
  autoCompletion: Boolean
  autoCompletionType: String
  sortField: String
  sortDirection: Int
  brand: String
  ${conformityQueryFields}
`;

export const queries = `
  companiesMain(${queryParams}): CompaniesListResponse
  companies(${queryParams}): [Company]
  companyCounts(${queryParams}, only: String): JSON
  companyDetail(_id: String!): Company
`;

const commonFields = `
  avatar: String,

  primaryName: String,
  names: [String]

  primaryPhone: String,
  phones: [String],

  primaryEmail: String,
  emails: [String],

  size: Int,
  website: String,
  industry: String,

  parentCompanyId: String,
  email: String,
  ownerId: String,
  businessType: String,
  description: String,
  doNotDisturb: String,
  links: JSON,

  tagIds: [String]
  customFieldsData: JSON
  code: String
`;

export const mutations = `
  companiesAdd(${commonFields}): Company
  companiesEdit(_id: String!, ${commonFields}): Company
  companiesRemove(companyIds: [String]): [String]
  companiesMerge(companyIds: [String], companyFields: JSON) : Company
`;
