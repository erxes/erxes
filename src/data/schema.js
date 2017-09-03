export const types = `
  scalar JSON
  scalar Date

  type Channel {
    _id: String!
    name: String
    description: String
    integrationIds: [String]
    memberIds: [String]
    createdAt: Date
    userId: String
    conversationCount: Int
    openConversationCount: Int
  }
`;

export const queries = `
  type Query {
    channels: [Channel]
  }
`;

export const mutations = `
`;

export const subscriptions = `
`;
