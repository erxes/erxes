export const types = `
  input UserDetails {
    avatar: String
    fullName: String
    shortName: String
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

  input InvitationEntry {
    email: String
    groupId: String
  }

  type UserDetailsType {
    avatar: String
    fullName: String
    shortName: String
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
    isActive: Boolean
    details: UserDetailsType
    links: UserLinksType
    status: String
    hasSeenOnBoard: Boolean
    emailSignatures: JSON
    getNotificationByEmail: Boolean
    groupIds: [String]
    brandIds: [String]

    isOwner: Boolean
    permissionActions: JSON
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
  links: UserLinks,	
  channelIds: [String],	
  groupIds: [String]
  brandIds: [String]
`;

const commonSelector = `
  searchValue: String,
  isActive: Boolean,
  ids: [String]
`;

export const queries = `
  users(page: Int, perPage: Int, status: String ${commonSelector}): [User]
  allUsers: [User]
  userDetail(_id: String): User
  usersTotalCount(${commonSelector}): Int
  currentUser: User
  userConversations(_id: String, perPage: Int): UserConversationListResponse
`;

export const mutations = `
  login(email: String!, password: String! deviceToken: String): String 
  logout: String
  forgotPassword(email: String!): String!
  resetPassword(token: String!, newPassword: String!): JSON
  usersEditProfile(
    username: String!,
    email: String!,
    details: UserDetails,
    links: UserLinks
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
