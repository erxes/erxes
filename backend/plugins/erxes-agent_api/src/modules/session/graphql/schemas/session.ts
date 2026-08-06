export const types = `
  type MastraThread {
    _id: String
    threadId: String
    agentId: String
    title: String
    messageCount: Int
    lastMessageAt: Date
    createdAt: Date
    updatedAt: Date
  }

  type MastraMessage {
    _id: String
    threadId: String
    role: String
    content: String
    meta: JSON
    attachments: JSON
    createdAt: Date
  }
`;

export const queries = `
  mastraThreads(agentId: String!): [MastraThread]
  mastraThreadMessages(threadId: String!): [MastraMessage]
`;

export const mutations = `
  mastraThreadRename(threadId: String!, title: String!): MastraThread
  mastraThreadRemove(threadId: String!): JSON
`;
