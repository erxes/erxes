import { GQL_CURSOR_PARAM_DEFS } from 'erxes-api-shared/utils';

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
    onboardedPlugins: [String]
    contactRemaining: Boolean
    experienceName: String
    experience: JSON
    bundleNames: [String]
  
    charge: JSON
    createdAt: Date
    category: String
  }


  type User @key(fields: "_id") @cacheControl(maxAge: 3) {
    _id: String
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
    onboardedPlugins: [String]
    groupIds: [String]
    permissionGroupIds: [String]
    customPermissions: [CustomPermission]
    isSubscribed: String
    isShowNotification: Boolean
    propertiesData: JSON

    isOwner: Boolean
    configs: JSON
    configsConstants: [JSON]
  
    department: Department

    departmentIds: [String]
    brandIds: [String]
    brands: [Brand]
    departments: [Department]
    branchIds: [String]
    branches: [Branch]
    positionIds: [String]
    positions: [Position]
    score: Float
    leaderBoardPosition: Int
    employeeId: String
    isOnboarded: Boolean
    cursor: String
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

  type UsersListResponse {
    list: [User]
    totalCount: Int
    pageInfo: PageInfo
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
  positionIds: [String]
  departmentIds: [String]
  propertiesData: JSON
  employeeId: String
  password: String
  isOnboarded: Boolean
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
  users(sortField: String, status: String, excludeIds: Boolean, ${commonSelector} ${GQL_CURSOR_PARAM_DEFS}): UsersListResponse
  allUsers(isActive: Boolean,ids:[String],assignedToMe:String,searchValue:String): [User]
  userDetail(_id: String): User
  usersTotalCount(${commonSelector}): Int
  userMovements(userId: String!,contentType: String):[UserMovement]
`;

export const mutations = `
  usersResetMemberPassword(_id: String!, newPassword: String!): User
  usersEditProfile(
    username: String!,
    email: String!,
    details: UserDetails,
    links: JSON
    employeeId: String
    positionIds: [String]
  ): User
  usersEdit(_id: String!, ${commonParams}): User
  usersChangePassword(currentPassword: String!, newPassword: String!): User
  usersSetActiveStatus(_id: String!): User
  usersInvite(entries: [InvitationEntry]): Boolean
  usersResendInvitation(email: String!): String
  usersConfirmInvitation(token: String): String
  usersConfigEmailSignatures(signatures: [EmailSignature]): User
  usersConfigGetNotificationByEmail(isAllowed: Boolean): User
  usersSetChatStatus(_id: String!, status: UserChatStatus): User
  editOrganizationInfo(icon: String, logo: String, link: String, name: String, iconColor: String, backgroundColor: String, description: String, domain: String, favicon: String, textColor: String): Organization
  editOrganizationDomain(type: String, domain: String): Organization
  usersCreateOwner(email: String!, password: String!, firstName: String!, lastName: String, purpose: String, subscribeEmail: Boolean): String
`;
