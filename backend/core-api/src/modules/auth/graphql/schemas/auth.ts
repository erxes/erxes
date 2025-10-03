export const queries = `
  currentUser: User
`;

export const mutations = `
  login(email: String!, password: String! deviceToken: String): String
  logout: String
  forgotPassword(email: String!): String!
  resetPassword(token: String!, newPassword: String!): JSON
  loginWithGoogle: String
  loginWithMagicLink(email: String!): String

 `;
