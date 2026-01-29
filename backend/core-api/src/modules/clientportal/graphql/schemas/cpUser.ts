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
    erxesCustomerId: String
    erxesCompanyId: String
    customFieldsData: JSON
    verificationRequest: VerificationRequest
    isVerified: Boolean!
    isPhoneVerified: Boolean!
    isEmailVerified: Boolean!
    fcmTokens: [String]
    socialAuthProviders: [SocialAuthProviderInfo]
    failedLoginAttempts: Int
    accountLockedUntil: Date
    lastLoginAt: Date
    primaryAuthMethod: AuthMethod
    otpResendAttempts: Int
    otpResendLastAttempt: Date
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

  type CPUserListResponse {
    list: [CPUser]
    totalCount: Int
    pageInfo: PageInfo
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
  firstName: String,
  lastName: String,
  avatar: String,
  username: String,
  companyName: String,
  companyRegistrationNumber: String,
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
  firstName: String,
  lastName: String,
  avatar: String,
  username: String,
  companyName: String,
  companyRegistrationNumber: String,
`;

export const mutations = `
  cpUsersAdd(${cpUsersAddParams}): CPUser
  cpUsersEdit(${cpUsersEditParams}): CPUser
  cpUsersRemove(_id: String!): JSON
  clientPortalUserRegister(${userRegisterParams}): CPUser
  clientPortalUserEdit(${userEditParams}): CPUser
  clientPortalUserVerify(userId: String, code: Int!, email: String, phone: String): CPUser
  clientPortalUserLoginWithCredentials(email: String, phone: String, password: String): JSON
  clientPortalLogout: String
  clientPortalUserForgotPassword(identifier: String!): String
  clientPortalUserResetPassword(token: String, newPassword: String!, otp: Int): String
  clientPortalUserRequestOTP(identifier: String!): String
  clientPortalUserLoginWithOTP(identifier: String!, otp: Int!): JSON
  clientPortalUserRegisterWithSocial(provider: SocialAuthProvider!, token: String!): CPUser
  clientPortalUserLoginWithSocial(provider: SocialAuthProvider!, token: String!): String
  clientPortalUserLinkSocialAccount(provider: SocialAuthProvider!, token: String!): CPUser
  clientPortalUserUnlinkSocialAccount(provider: SocialAuthProvider!): CPUser
  clientPortalUserRefreshToken(refreshToken: String!): String
  clientPortalUserAddFcmToken(fcmToken: String!): CPUser
  clientPortalUserRemoveFcmToken(fcmToken: String!): CPUser
`;

export const queries = `
  clientPortalCurrentUser: CPUser
  getClientPortalUsers(filter: IClientPortalUserFilter): CPUserListResponse
  getClientPortalUser(_id: String!): CPUser
`;
