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
    channels(limit: Int!): [Channel]
    totalChannelsCount: Int
  }
`;

export const mutations = `
`;

export const subscriptions = `
`;
