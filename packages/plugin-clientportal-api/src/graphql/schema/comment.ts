export const types = `
  type ClientPortalComment @key(fields: "_id") {
    _id: String!
    type: String,
    typeId: String,
    userId: String,
    
    userType: String,
    content: String

    createdUser: JSON
    createdAt: Date
  }
`;

export const queries = `
  clientPortalComments(typeId: String! type: String!): [ClientPortalComment]
`;
