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
    description: String
    visibility: String
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

  enum ChatMemberModifyType {
    add
    remove
  }

  enum ChatVisibilityType {
    public
    private
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
  chatAdd(name: String!, type: ChatType!, , description: String, visibility: ChatVisibilityType, participantIds: [String]): Chat
  chatEdit(_id: String!, name: String!, description: String, visibility: ChatVisibilityType): Chat
  chatRemove(_id: String!): JSON
  chatAddOrRemoveMember(_id: String!, userIds: [String], type: ChatMemberModifyType): String
  
  chatMessageAdd(chatId: String!, content: String!): ChatMessage
  chatMessageRemove(_id: String!): JSON
`;

export const subscriptions = `
  chatMessageInserted(chatId: String!): ChatMessage
`;
