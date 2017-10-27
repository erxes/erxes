export const types = `
  type User {
    _id: String!
    username: String
    details: JSON
    emails: JSON
  }

  type AuthPayload {
    token: String!
    refreshToken: String!
  }
`;

export const queries = `
  users(limit: Int): [User]
  userDetail(_id: String): User
  usersTotalCount: Int
  currentUser: User
`;

export const mutations = `
  login(email: String!, password: String!): AuthPayload!
  forgotPassword(email: String!): String!
  resetPassword(token: String!, newPassword: String!): String
`;
