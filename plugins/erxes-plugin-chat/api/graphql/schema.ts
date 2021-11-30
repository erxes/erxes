export const types = `
  type ChatMessage {
    _id: String!
    content: String
    createdDate: Date
  }

  type Chat {
    _id: String!
    lastChatMessage: ChatMessage
    createdDate: Date
  }
`;

export const queries = `
  chats: [Chat]
  chatDetail(_id: String!): Chat
`;

export const mutations = `
  chatsAdd(content: String!): Chat
  chatMessagesRemove(_id: String!): JSON
`;
