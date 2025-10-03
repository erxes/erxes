export const TypeExtensions = `
  extend type User @key(fields: "_id") {
    _id: String @external
    conversations: [Conversation]
  }
`;
