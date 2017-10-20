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
  channelsAdd(
    name: String!,
    description: String,
    memberIds: [String],
    integrationIds: [String]): Channel

  channelsEdit(
    _id: String!,
    name: String!,
    description: String,
    memberIds: [String],
    integrationIds: [String]): Channel

  channelsRemove(_id: String!): String
`;
