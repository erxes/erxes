export const types = `
  input UserDetails {
    avatar: String
    fullName: String
    shortName: String
    birthDate: Date
    position: String
    workStartedDate: Date
    location: String
    description: String
    operatorPhone: String
  }

  input EmailSignature {
    brandId: String
    signature: String
  }

  input InvitationEntry {
    email: String
    password: String
    groupId: String
    channelIds: [String]
  }

  type UserDetailsType {
    avatar: String
    fullName: String
    shortName: String
    birthDate: Date
    position: String
    workStartedDate: Date
    location: String
    description: String
    operatorPhone: String
  }

  type User {
    _id: String!
    createdAt: Date
    username: String
    email: String
    isActive: Boolean
    details: UserDetailsType
    links: JSON
    status: String
    emailSignatures: JSON
    getNotificationByEmail: Boolean
    groupIds: [String]
    brandIds: [String]
    isSubscribed: String
    isShowNotification: Boolean
    customFieldsData: JSON

    brands: [Brand]
    isOwner: Boolean
    permissionActions: JSON
    configs: JSON
    configsConstants: [JSON]
    onboardingHistory: OnboardingHistory
    score: Float
  }

  type UserConversationListResponse {
    list: [Conversation],
    totalCount: Float,
  }
`;

const commonParams = `
  username: String!,
  email: String!,
  details: UserDetails,
  links: JSON,
  channelIds: [String],
  groupIds: [String]
  brandIds: [String]
  customFieldsData: JSON
`;

const commonSelector = `
  searchValue: String,
  isActive: Boolean,
  requireUsername: Boolean,
  ids: [String],
  brandIds: [String]
`;

export const queries = `
  users(page: Int, perPage: Int, status: String, excludeIds: Boolean, ${commonSelector}): [User]
  allUsers(isActive: Boolean): [User]
  userDetail(_id: String): User
  usersTotalCount(${commonSelector}): Int
  currentUser: User
  userConversations(_id: String, perPage: Int): UserConversationListResponse
`;

export const mutations = `
  usersCreateOwner(email: String!, password: String!, firstName: String!, lastName: String, purpose: String, subscribeEmail: Boolean): String
  login(email: String!, password: String! deviceToken: String): String
  logout: String
  forgotPassword(email: String!): String!
  resetPassword(token: String!, newPassword: String!): JSON
  usersResetMemberPassword(_id: String!, newPassword: String!): User
  usersEditProfile(
    username: String!,
    email: String!,
    details: UserDetails,
    links: JSON
    password: String!
  ): User
  usersEdit(_id: String!, ${commonParams}): User
  usersChangePassword(currentPassword: String!, newPassword: String!): User
  usersSetActiveStatus(_id: String!): User
  usersInvite(entries: [InvitationEntry]): Boolean
  usersResendInvitation(email: String!): String
  usersConfirmInvitation(token: String, password: String, passwordConfirmation: String, fullName: String, username: String): User
  usersSeenOnBoard: User
  usersConfigEmailSignatures(signatures: [EmailSignature]): User
  usersConfigGetNotificationByEmail(isAllowed: Boolean): User
 `;
