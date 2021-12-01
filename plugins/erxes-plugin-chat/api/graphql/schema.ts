export const types = `
  type ChatMessage {
    _id: String!
    content: String
    createdUser: User
    createdAt: Date
  }

  type Chat {
    _id: String!
    name: String
    lastChatMessage: ChatMessage
    createdUser: User
    createdAt: Date
  }
`;

const paginationParams = `
  limit: Int
  skip: Int
`;

export const queries = `
  chats(${paginationParams}): [Chat]
  chatDetail(_id: String!): Chat
  chatMessages(chatId: String! ${paginationParams}): [ChatMessage]
`;

export const mutations = `
  chatAdd(name: String!): Chat
  chatEdit(_id: String!, name: String!): Chat
  chatRemove(_id: String!): Chat
  
  chatMessageAdd(chatId: String, content: String!): ChatMessage
  chatMessageRemove(_id: String!): JSON
`;
