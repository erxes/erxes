export const types = `
  type TicketComment @key(fields: "_id") {
    _id: String!
    type: String,
    typeId: String,
    userId: String,
    
    userType: String,
    content: String,
    createdUser: CommentsUser,
    createdAt: Date
  }
`;
