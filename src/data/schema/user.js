export const types = `
  input UserDetails {
    avatar: String
    fullName: String
    position: String
    twitterUsername: String
  }

  input EmailSignature {
    brandId: String
    signature: String
  }

  type User {
    _id: String!
    username: String
    email: String
    role: String
    details: JSON
    emailSignatures: JSON
    getNotificationByEmail: Boolean
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

const commonParams = `
  username: String!,
  email: String!,
  role: String!
  details: UserDetails,
  channelIds: [String],
  password: String!,
  passwordConfirmation: String!
`;

export const mutations = `
  login(email: String!, password: String!): AuthPayload!
  forgotPassword(email: String!): String!
  resetPassword(token: String!, newPassword: String!): String
  usersAdd(${commonParams}): User
  usersEdit(_id: String!, ${commonParams}): User

  usersEditProfile(
    username: String!,
    email: String!,
    details: UserDetails,
    password: String!
  ): User

  usersChangePassword(currentPassword: String!, newPassword: String!): User
  usersRemove(_id: String!): String

  usersConfigEmailSignatures(signatures: [EmailSignature]): User
  usersConfigGetNotificationByEmail(isAllowed: Boolean): User
`;
