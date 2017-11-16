export const types = `
  type Customer {
    _id: String!
    integrationId: String
    name: String
    firstName: String
    lastName: String
    email: String
    phone: String
    isUser: Boolean
    createdAt: Date
    tagIds: [String]
    internalNotes: JSON

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
`;

const queryParams = `
  page: Int,
  perPage: Int,
  segment: String,
  tag: String,
  ids: [String]
`;

export const queries = `
  customers(${queryParams}): [Customer]
  customerCounts(${queryParams}): JSON
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
`;
