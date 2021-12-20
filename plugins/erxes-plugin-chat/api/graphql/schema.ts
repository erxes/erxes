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
    lastMessage: ChatMessage
    participantUsers: [User]
    createdUser: User
    createdAt: Date
  }

  type ChatResponse {
    list: [Chat]
    totalCount: Int
  }

  type ChatMessageResponse {
    list: [ChatMessage]
    totalCount: Int
  }

  enum ChatType {
    direct
    group
  }
`;

const paginationParams = `
  limit: Int
  skip: Int
`;

export const queries = `
  chats(type: ChatType!, ${paginationParams}): ChatResponse
  chatDetail(_id: String!): Chat
  
  chatMessages(chatId: String, userIds: [String], ${paginationParams}): ChatMessageResponse

  getChatIdByUserIds(userIds: [String]): String
`;

export const mutations = `
  chatAdd(name: String!, type: ChatType!, participantIds: [String]): Chat
  chatEdit(_id: String!, name: String!): Chat
  chatRemove(_id: String!): JSON
  
  chatMessageAdd(chatId: String, participantIds: [String], content: String!): ChatMessage
  chatMessageRemove(_id: String!): JSON
`;

export const subscriptions = `
  chatMessageInserted(chatId: String!): ChatMessage
`;
