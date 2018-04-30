export const types = `
  input UserDetails {
    avatar: String
    fullName: String
    position: String
    location: String
    description: String
  }

  input UserLinks {
    linkedIn: String
    twitter: String
    facebook: String
    youtube: String
    github: String
    website: String
  }

  input EmailSignature {
    brandId: String
    signature: String
  }

  type UserDetailsType {
    avatar: String
    fullName: String
    position: String
    location: String
    description: String
  }

  type UserLinksType {
    linkedIn: String
    twitter: String
    facebook: String
    github: String
    youtube: String
    website: String
  }

  type User {
    _id: String!
    username: String
    email: String
    role: String
    details: UserDetailsType
    links: UserLinksType
    emailSignatures: JSON
    getNotificationByEmail: Boolean
  }

  type AuthPayload {
    token: String!
    refreshToken: String!
  }

  type UserConversationListResponse {
    list: [Conversation],
    totalCount: Float,
  }
`;

export const queries = `
  users(page: Int, perPage: Int, searchValue: String): [User]
  userDetail(_id: String): User
  usersTotalCount: Int
  currentUser: User
  userConversations(_id: String, perPage: Int): UserConversationListResponse
`;

const commonParams = `
  username: String!,
  email: String!,
  role: String!
  details: UserDetails,
  links: UserLinks,
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
    links: UserLinks
    password: String!
  ): User

  usersChangePassword(currentPassword: String!, newPassword: String!): User
  usersRemove(_id: String!): String

  usersConfigEmailSignatures(signatures: [EmailSignature]): User
  usersConfigGetNotificationByEmail(isAllowed: Boolean): User
`;
