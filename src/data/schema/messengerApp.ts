export const types = `
  type MessengerApp {
    _id: String!
    kind: String!
    name: String!
    showInInbox: Boolean
    credentials: JSON
    accountId: String
  }
`;

export const queries = `
  messengerApps(kind: String): [MessengerApp]
  messengerAppsCount(kind: String): Int
`;

export const mutations = `
  messengerAppsAddKnowledgebase(name: String!, integrationId: String!, topicId: String!): MessengerApp
  messengerAppsAddLead(name: String!, integrationId: String!, formId: String!): MessengerApp
  messengerAppsRemove(_id: String!): JSON
`;
