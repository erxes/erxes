export const types = `
  type Channel {
    _id: String!
    name: String!
    description: String
    integrationIds: [String]
    memberIds: [String]
    createdAt: Date
    userId: String!
    conversationCount: Int
    openConversationCount: Int
  }
`;

export const queries = `
  channels(limit: Int, memberIds: [String]): [Channel]
  channelsTotalCount: Int
`;

export const mutations = `
  channelsCreate(
    name: String!,
    description: String,
    memberIds: [String],
    integrationIds: [String],
    userId: String!): Channel

  channelsUpdate(
    id: String!,
    name: String!,
    description: String,
    memberIds: [String],
    integrationIds: [String],
    userId: String!): Boolean

  channelsRemove(id: String!): Boolean
`;
