export const types = `
  input CustomerListParams {
    brand: String,
    integration: String,
    tag: String,
    limit: Int,
    page: String,
    segment: String,
    ids: [String]
  }

  type Customer {
    _id: String!
    integrationId: String
    name: String
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

export const queries = `
  customers(params: CustomerListParams): [Customer]
  customerCounts(params: CustomerListParams): JSON
  customerDetail(_id: String!): Customer
  customerActivityLog(_id: String!, sortDoc: ActivityLogSortDoc): [ActivityLogForMonth]
  customerListForSegmentPreview(segment: JSON, limit: Int): [Customer]
`;

const fields = `
  name: String
  email: String
  phone: String
  customFieldsData: JSON
`;

export const mutations = `
  customersAdd(${fields}): Customer
  customersEdit(_id: String!, ${fields}): Customer
  customersAddCompany(_id: String!, name: String!, website: String): Company
`;
