export const types = `
  type CallProConfig {
    enabled: Boolean!
    webhookUrl: String
  }

  type CallProIntegrationDetail {
    phoneNumber: String
    recordUrl: String
  }
`;

export const queries = `
  callProConfig: CallProConfig
  callProIntegrationDetail(integrationId: String!): CallProIntegrationDetail
  callProCustomersByPhone(phone: String!): JSON
`;

export const mutations = `
  callProCustomerSelect(conversationId: String!, customerId: String!): Conversation
`;
