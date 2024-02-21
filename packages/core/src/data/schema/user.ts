const commonDetailFields = `
  avatar: String
  coverPhoto: String
  fullName: String
  shortName: String
  birthDate: Date
  position: String
  workStartedDate: Date
  location: String
  description: String
  operatorPhone: String
  firstName: String
  middleName: String
  lastName: String
  employeeId: String
`;

export const types = `
  input UserDetails {
    ${commonDetailFields}
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
    unitId: String
    branchId: String
    departmentId: String
  }

  enum UserChatStatus{
    offline
    online
  }

  type UserDetailsType {
    ${commonDetailFields}
  }

  type CookieOrganization {
    subdomain: String
    name: String
  }
  
  type Organization {
    name: String
    icon: String
    subdomain: String
    promoCodes: [String]
    isPaid: Boolean
    expiryDate: Date
    plan: String
    purchased: Int
    isWhiteLabel: Boolean
    setupService: JSON
    onboardingDone: Boolean
    contactRemaining: Boolean
    experienceName: String
    bundleNames: [String]
  
    charge: JSON
    createdAt: Date
    category: String
  }


  type User @key(fields: "_id") @cacheControl(maxAge: 3) {
    _id: String!
    createdAt: Date
    username: String
    email: String
    isActive: Boolean
    details: UserDetailsType
    links: JSON
    status: String
    chatStatus: UserChatStatus
    emailSignatures: JSON
    getNotificationByEmail: Boolean

    currentOrganization: Organization
    organizations: [CookieOrganization]
    
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

    department: Department

    departmentIds: [String]
    departments: [Department]
    branchIds: [String]
    branches: [Branch]
    score: Float
    leaderBoardPosition: Int
    employeeId: String
  }

  type UserMovement {
    _id: String
    createdAt: Date
    createdBy: String
    createdByDetail:JSON
    userId:String
    userDetail:JSON
    contentType:String
    contentTypeId:String
    contentTypeDetail:JSON
    status:String
  }
`;

const commonParams = `
  username: String,
  email: String,
  details: UserDetails,
  links: JSON,
  channelIds: [String],
  groupIds: [String]
  brandIds: [String]
  branchIds: [String]
  departmentIds: [String]
  customFieldsData: JSON
  employeeId: String
`;

const commonSelector = `
  searchValue: String,
  isActive: Boolean,
  requireUsername: Boolean,
  ids: [String],
  brandIds: [String]
  departmentId: String
  branchId: String
  isAssignee: Boolean
  branchIds: [String]
  departmentIds: [String]
  unitId: String
  segment: String
  segmentData: String
`;

export const queries = `
  users(sortField: String, sortDirection: Int, page: Int, perPage: Int, status: String, excludeIds: Boolean, ${commonSelector}): [User]
  allUsers(isActive: Boolean,ids:[String],assignedToMe:String): [User]
  userDetail(_id: String): User
  usersTotalCount(${commonSelector}): Int
  currentUser: User
  userMovements(userId: String!,contentType: String):[UserMovement]
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
    employeeId: String
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
  usersSetChatStatus(_id: String!, status: UserChatStatus): User
  editOrganizationInfo(icon: String, logo: String, link: String, name: String, iconColor: String, backgroundColor: String, description: String, domain: String, favicon: String, textColor: String): Organization
  editOrganizationDomain(type: String, domain: String): Organization
  loginWithGoogle: String
  loginWithMagicLink(email: String!): String
 `;
