export const types = `
  input UserDetails {
    avatar: String
    fullName: String
    position: String
    twitterUsername: String
  }

  type User {
    _id: String!
    username: String
    email: String
    role: String
    details: JSON
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

  usersAdd(
    username: String!,
    email: String!,
    role: String!
    details: UserDetails,
    channelIds: [String],
    password: String!,
    passwordConfirmation: String!
  ): User
`;
