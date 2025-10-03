import { GQL_CURSOR_PARAM_DEFS } from 'erxes-api-shared/utils';

export const conformityQueryFields = `
  conformityMainType: String
  conformityMainTypeId: String
  conformityRelType: String
  conformityIsRelated: Boolean
  conformityIsSaved: Boolean
`;

export const types = `
  type Company @key(fields: "_id") @cacheControl(maxAge: 3) {
    _id:String
    createdAt: Date
    updatedAt: Date
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
    primaryAddress: JSON
    addresses: [JSON]
    status: String
    businessType: String
    description: String
    isSubscribed: String
    links: JSON
    owner: User
    parentCompany: Company

    tagIds: [String]

    customFieldsData: JSON
    customFieldsDataByFieldCode: JSON
    trackedData: JSON

    customers: [Customer]
    getTags: [Tag]
    code: String
    location: String
    score: Float

    cursor: String
  }

  type CompaniesListResponse {
    list: [Company],
    pageInfo: PageInfo
    totalCount: Int,
  }
`;

const queryParams = `
  segment: String

  tagIds: [String]
  excludeTagIds: [String]
  tagWithRelated: Boolean
  ids: [String]
  excludeIds: Boolean
  searchValue: String
  autoCompletion: Boolean
  autoCompletionType: String
  sortField: String
  sortDirection: Int
  dateFilters: String
  segmentData: String

  status: CONTACT_STATUS
  ${conformityQueryFields}
  ${GQL_CURSOR_PARAM_DEFS}
`;

export const queries = `
  companies(${queryParams}): CompaniesListResponse
  companyDetail(_id: String!): Company
`;

const mutationParams = `
  avatar: String,

  primaryName: String,
  names: [String]

  primaryPhone: String,
  phones: [String],

  primaryEmail: String,
  emails: [String],

  primaryAddress: JSON,
  addresses: [JSON],

  size: Int,
  website: String,
  industry: String,

  parentCompanyId: String,
  email: String,
  ownerId: String,
  businessType: String,
  description: String,
  isSubscribed: String,
  links: JSON,

  tagIds: [String]
  customFieldsData: JSON
  code: String
  location: String
`;

export const mutations = `
  companiesAdd(${mutationParams}): Company
  companiesEdit(_id: String!, ${mutationParams}): Company
  companiesRemove(companyIds: [String]): [String]
  companiesMerge(companyIds: [String], companyFields: JSON) : Company
`;
