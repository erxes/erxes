import { conformityQueryFields } from './company';

// TODO: remove customer's email and phone field after customCommand

export const types = (tagsEnabled, inboxEnabled) => `
  type CustomerConnectionChangedResponse {
    _id: String!
    status: String!
  }

  type Customer @key(fields: "_id") @cacheControl(maxAge: 3) {
    _id: String!
    state: String
    createdAt: Date
    modifiedAt: Date
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

    phone: String
    tagIds: [String]
    remoteAddress: String
    location: JSON
    visitorContactInfo: JSON
    customFieldsData: JSON
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

    isOnline: Boolean
    lastSeenAt: Date
    sessionCount: Int
    urlVisits: [JSON]

    links: JSON
    companies: [Company]

    ${tagsEnabled ? 'getTags: [Tag]' : ''}
    ${inboxEnabled ? 'integration: Integration' : ''}
    
    owner: User
    score: Float
  }

  type CustomersListResponse {
    list: [Customer],
    totalCount: Float,
  }
`;

const queryParams = `
  page: Int
  perPage: Int
  segment: String
  type: String
  tag: String
  ids: [String]
  excludeIds: Boolean
  searchValue: String
  autoCompletion: Boolean
  autoCompletionType: String
  brand: String
  integration: String
  form: String
  startDate: String
  endDate: String
  leadStatus: String
  sortField: String
  sortDirection: Int
  sex:Int
  birthDate: Date
  dateFilters: String
  segmentData: String
  ${conformityQueryFields}
`;

export const queries = `
  customersMain(${queryParams}): CustomersListResponse
  customers(${queryParams}): [Customer]
  customerCounts(${queryParams}, only: String, source: String): JSON
  customerDetail(_id: String!): Customer
  contactsLogs(action: String, content:JSON, contentId: String, contentType: String): JSON
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
  customersEditByField(selector: JSON, doc: JSON): Customer
  customersMerge(customerIds: [String], customerFields: JSON): Customer
  customersRemove(customerIds: [String]): [String]
  customersChangeState(_id: String!, value: String!): Customer
  customersVerify(verificationType:String!): String
  customersChangeVerificationStatus(customerIds: [String], type: String!, status: String!): [Customer]
  customersChangeStateBulk(_ids: [String]!, value: String!): JSON
`;
