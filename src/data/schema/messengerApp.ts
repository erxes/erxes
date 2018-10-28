export const types = `
  type MessengerApp {
    _id: String!
    kind: String!
    name: String!
    showInInbox: Boolean
    credentials: JSON
  }
`;

export const queries = `
  messengerApps(kind: String): [MessengerApp]
`;

export const mutations = `
  messengerAppsAddGoogleMeet(name: String!, credentials: JSON): MessengerApp
  messengerAppsAddKnowledgebase(name: String!, integrationId: String!, topicId: String!): MessengerApp
  messengerAppsAddLead(name: String!, integrationId: String!, formId: String!): MessengerApp
  messengerAppsExecuteGoogleMeet(_id: String!, conversationId: String!): String
`;
