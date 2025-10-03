import { GQL_CURSOR_PARAM_DEFS } from 'erxes-api-shared/utils';

export const types = `
  type Customer @key(fields: "_id") @cacheControl(maxAge: 3) {
    _id: String
    state: String
    createdAt: Date
    updatedAt: Date
    avatar: String
    integrationId: String
    firstName: String
    lastName: String
    middleName: String

    birthDate: Date
    sex: Int

    email: String
    primaryEmail: String
    emails: [String]
    primaryPhone: String
    phones: [String]
    primaryAddress: JSON
    addresses: [JSON]

    phone: String
    tagIds: [String]
    remoteAddress: String
    location: JSON
    visitorContactInfo: JSON
    customFieldsData: JSON
    customFieldsDataByFieldCode: JSON
    trackedData: JSON
    ownerId: String
    position: String
    department: String
    leadStatus: String
    hasAuthority: String
    description: String
    isSubscribed: String
    code: String
    emailValidationStatus: String
    phoneValidationStatus: String
    status: String
    isOnline: Boolean
    lastSeenAt: Date
    sessionCount: Int
    urlVisits: [JSON]
    owner: User
    score: Float
    links: JSON
    companies: [Company]
    getTags: [Tag]

    cursor: String
  }

  type CustomersListResponse {
    list: [Customer],
    pageInfo: PageInfo
    totalCount: Int,
  }

`;

export const conformityQueryFields = `
  conformityMainType: String
  conformityMainTypeId: String
  conformityRelType: String
  conformityIsRelated: Boolean
  conformityIsSaved: Boolean
`;

const queryParams = `
  segment: String
  type: String
  ids: [String]
  excludeIds: Boolean

  tagIds: [String]
  excludeTagIds: [String]
  tagWithRelated: Boolean

  brandIds: [String]

  integrationIds: [String]
  integrationTypes: [String]

  formIds: [String]

  searchValue: String
  autoCompletion: Boolean
  autoCompletionType: String
  startDate: String
  endDate: String
  leadStatus: String
  sortField: String
  sortDirection: Int
  sex:Int
  birthDate: Date
  dateFilters: String
  segmentData: String
  emailValidationStatus:String
  status: CONTACT_STATUS

  ${conformityQueryFields}
  ${GQL_CURSOR_PARAM_DEFS}
`;

export const queries = `
  customers(${queryParams}): CustomersListResponse
  customerDetail(_id: String!): Customer
  contactsLogs(action: String, content:JSON, contentType: String): JSON
`;

const fields = `
  avatar: String
  firstName: String
  lastName: String
  middleName: String
  primaryEmail: String
  emails: [String]
  primaryPhone: String
  phones: [String]
  primaryAddress: JSON
  addresses: [JSON]
  ownerId: String
  position: String
  department: String
  leadStatus: String
  hasAuthority: String
  description: String
  isSubscribed: String
  links: JSON
  customFieldsData: JSON
  code: String
  sex: Int
  birthDate: Date
  emailValidationStatus: String
  phoneValidationStatus: String
`;

export const mutations = `
  customersAdd(state: String, ${fields}): Customer
  customersEdit(_id: String!, ${fields}): Customer
  customersRemove(customerIds: [String]): [String]

  customersMerge(customerIds: [String], customerFields: JSON): Customer
  customersVerify(verificationType:String!): String

  customersChangeState(_id: String!, value: String!): Customer
  customersChangeVerificationStatus(customerIds: [String], type: String!, status: String!): [Customer]
  customersChangeStateBulk(_ids: [String]!, value: String!): JSON
`;
