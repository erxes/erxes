import { GQL_CURSOR_PARAM_DEFS } from 'erxes-api-shared/utils';

export const types = `
  type CPUser {
    _id: String!
    type: String
    email: String
    phone: String
    username: String
    code: String
    firstName: String
    lastName: String
    avatar: String
    companyName: String
    companyRegistrationNumber: String
    clientPortalId: String!
    clientPortal: ClientPortal
    erxesCustomerId: String
    erxesCompanyId: String
    customFieldsData: JSON
    verificationRequest: VerificationRequest
    isVerified: Boolean!
    isPhoneVerified: Boolean!
    isEmailVerified: Boolean!
    fcmTokens: [FcmDevice]
    socialAuthProviders: [SocialAuthProviderInfo]
    failedLoginAttempts: Int
    accountLockedUntil: Date
    lastLoginAt: Date
    primaryAuthMethod: AuthMethod
    otpResendAttempts: Int
    otpResendLastAttempt: Date
    customer: Customer
    company: Company
    createdAt: Date
    updatedAt: Date
  }

  type VerificationRequest {
    status: String
    attachments: [Attachment]
    description: String
    verifiedBy: String
  }


  type ActionCode {
    code: String
    expires: Date
    type: ActionCodeType
  }

  enum ActionCodeType {
    EMAIL_VERIFICATION
    PHONE_VERIFICATION
    PASSWORD_RESET
    TWO_FACTOR_VERIFICATION
    EMAIL_CHANGE
    PHONE_CHANGE
  }

  type RefreshToken {
    token: String
    deviceId: String
    userAgent: String
    ipAddress: String
    createdAt: Date
    expiresAt: Date
  }

  enum CPUserType {
    customer
    company
  }

  enum SocialAuthProvider {
    GOOGLE
    FACEBOOK
    APPLE
  }

  enum AuthMethod {
    EMAIL
    PHONE
    SOCIAL
  }

  type SocialAuthProviderInfo {
    provider: SocialAuthProvider
    providerId: String
    email: String
    linkedAt: Date
  }

  enum FcmPlatform {
    ios
    android
    web
  }

  type FcmDevice {
    deviceId: String!
    token: String!
    platform: FcmPlatform!
  }

  type CPUserListResponse {
    list: [CPUser]
    totalCount: Int
    pageInfo: PageInfo
  }

  type CPUserRemoveResponse {
    _id: String!
  }

  input IClientPortalUserFilter {
    ${GQL_CURSOR_PARAM_DEFS}
    searchValue: String
    type: CPUserType
    isVerified: Boolean
    clientPortalId: String
  }
`;

const userRegisterParams = `
  phone: String,
  email: String,
  username: String,
  password: String,
  firstName: String,
  lastName: String,
  userType: CPUserType,
`;

const userEditParams = `
  email: String,
  phone: String,
  firstName: String,
  lastName: String,
  avatar: String,
  username: String,
  companyName: String,
  companyRegistrationNumber: String,
`;

const clientPortalCustomerEditParams = `
  firstName: String,
  lastName: String,
  primaryEmail: String,
  emails: [String],
  primaryPhone: String,
  phones: [String],
  primaryAddress: JSON,
  addresses: [JSON],
  propertiesData: JSON,
`;

const clientPortalCompanyEditParams = `
  primaryName: String,
  names: [String],
  primaryEmail: String,
  emails: [String],
  primaryPhone: String,
  phones: [String],
  primaryAddress: JSON,
  addresses: [JSON],
  size: Int,
  website: String,
  industry: [String],
  ownerId: String,
  businessType: String,
  description: String,
  isSubscribed: String,
  links: JSON,
  tagIds: [String],
  propertiesData: JSON,
  code: String,
  location: String,
`;

const cpUsersAddParams = `
  clientPortalId: String!,
  email: String,
  phone: String,
  username: String,
  password: String,
  firstName: String,
  lastName: String,
  userType: CPUserType,
`;

const cpUsersEditParams = `
  _id: String!,
  email: String,
  phone: String,
  firstName: String,
  lastName: String,
  avatar: String,
  username: String,
  companyName: String,
  companyRegistrationNumber: String,
  erxesCustomerId: String,
`;

export const mutations = `
  cpUsersAdd(${cpUsersAddParams}): CPUser
  cpUsersEdit(${cpUsersEditParams}): CPUser
  cpUsersRemove(_id: String!): CPUserRemoveResponse
  cpUsersSetPassword(_id: String!, newPassword: String!): CPUser
  clientPortalUserRegister(${userRegisterParams}): CPUser
  clientPortalUserEdit(${userEditParams}): CPUser
  clientPortalCustomerEdit(${clientPortalCustomerEditParams}): Customer
  clientPortalCompanyEdit(${clientPortalCompanyEditParams}): Company
  clientPortalUserVerify(userId: String, code: String!, email: String, phone: String): CPUser
  clientPortalUserLoginWithCredentials(email: String, phone: String, password: String): JSON
  clientPortalLogout: String
  clientPortalUserForgotPassword(identifier: String!): String
  clientPortalUserResetPassword(token: String, identifier: String, code: String, newPassword: String!): String
  clientPortalUserRequestOTP(identifier: String!): String
  clientPortalUserLoginWithOTP(identifier: String!, otp: String!): JSON
  clientPortalUserRegisterWithSocial(provider: SocialAuthProvider!, token: String!): CPUser
  clientPortalUserLoginWithSocial(provider: SocialAuthProvider!, token: String!): String
  clientPortalUserLinkSocialAccount(provider: SocialAuthProvider!, token: String!): CPUser
  clientPortalUserUnlinkSocialAccount(provider: SocialAuthProvider!): CPUser
  clientPortalUserRefreshToken(refreshToken: String!): String
  clientPortalUserAddFcmToken(deviceId: String!, token: String!, platform: FcmPlatform!): CPUser
  clientPortalUserRemoveFcmToken(deviceId: String!): CPUser
  clientPortalUserRequestChangeEmail(newEmail: String!): String
  clientPortalUserConfirmChangeEmail(code: String!): CPUser
  clientPortalUserRequestChangePhone(newPhone: String!): String
  clientPortalUserConfirmChangePhone(code: String!): CPUser
`;

export const queries = `
  clientPortalCurrentUser: CPUser
  getClientPortalUsers(filter: IClientPortalUserFilter): CPUserListResponse
  getClientPortalUser(_id: String!): CPUser
`;
