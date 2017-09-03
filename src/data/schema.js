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

  type Brand {
    _id: String!
    name: String
    description: String
    code: String
    userId: String
    createdAt: Date
    emailConfig: JSON
  }
`;

export const queries = `
  type Query {
    channels(limit: Int!): [Channel]
    totalChannelsCount: Int

    brands(limit: Int!): [Brand]
    totalBrandsCount: Int
  }
`;

export const mutations = `
`;

export const subscriptions = `
`;
