export const types = `
  type MessengerApp {
    _id: String!
    kind: String!
    name: String!
  }
`;

export const queries = `
  messengerApps: [MessengerApp]
`;

export const mutations = `
  messengerAppsAdd(kind: String!, name: String!, credentials: JSON): MessengerApp
  messengerAppsExecute(_id: String!, conversationId: String!): String
`;
