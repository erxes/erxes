import { conformityQueryFields } from './common';

// TODO: remove customer's email and phone field after customCommand

export const types = `
  type CustomerConnectionChangedResponse {
    _id: String!
    status: String!
  }

  type Customer {
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
    internalNotes: JSON
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

    integration: Integration
    links: JSON
    companies: [Company]
    conversations: [Conversation]
    getTags: [Tag]
    owner: User
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
  ${conformityQueryFields}
`;

export const queries = `
  customersMain(${queryParams}): CustomersListResponse
  customers(${queryParams}): [Customer]
  customerCounts(${queryParams}, only: String, source: String): JSON
  customerDetail(_id: String!): Customer
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
  customersMerge(customerIds: [String], customerFields: JSON): Customer
  customersRemove(customerIds: [String]): [String]
  customersChangeState(_id: String!, value: String!): Customer
  customersVerify(verificationType:String!): String
  customersChangeVerificationStatus(customerIds: [String], type: String!, status: String!): [Customer]
`;
