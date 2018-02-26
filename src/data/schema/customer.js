export const types = `
  type CustomerConnectionChangedResponse {
    _id: String!
    status: String!
  }

  type Customer {
    _id: String!
    integrationId: String
    firstName: String
    lastName: String
    email: String
    phone: String
    isUser: Boolean
    createdAt: Date
    tagIds: [String]
    remoteAddress: String
    internalNotes: JSON
    location: JSON
    visitorContactInfo: JSON
    customFieldsData: JSON
    messengerData: JSON
    twitterData: JSON
    facebookData: JSON

    companies: [Company]
    conversations: [Conversation]
    getIntegrationData: JSON
    getMessengerCustomData: JSON
    getTags: [Tag]
  }

  type CustomersListResponse {
    list: [Customer],
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
  customersMain(${queryParams}): CustomersListResponse
  customers(${queryParams}): [Customer]
  customerCounts(${queryParams}, byFakeSegment: JSON): JSON
  customerDetail(_id: String!): Customer
  customerListForSegmentPreview(segment: JSON, limit: Int): [Customer]
`;

const fields = `
  firstName: String
  lastName: String
  email: String
  phone: String
  customFieldsData: JSON
`;

export const mutations = `
  customersAdd(${fields}): Customer
  customersEdit(_id: String!, ${fields}): Customer
  customersAddCompany(_id: String!, name: String!, website: String): Company
  customersEditCompanies(_id: String!, companyIds: [String]): Customer
  customersMerge(customerIds: [String], customerFields: JSON): Customer
  customersRemove(customerIds: [String]): [String]
`;
