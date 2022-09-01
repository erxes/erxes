export const types = (isContactsEnabled: boolean) => `

${
  isContactsEnabled
    ? `
      extend type Customer @key(fields: "_id") {
        _id: String! @external
      }

      extend type Company @key(fields: "_id") {
        _id: String! @external
      }
      `
    : ''
}

  type ClientPortalUser @key(fields: "_id") {
    _id: String!
    createdAt: Date
    modifiedAt: Date
    firstName: String
    lastName: String
    phone: String
    email: String
    username: String
    type: String
    companyName: String
    companyRegistrationNumber: String
    erxesCustomerId: String
    erxesCompanyId: String
    clientPortalId: String
    code: String,
    ownerId: String,
    links: JSON,
    customFieldsData: JSON,
    password: String
    isEmailVerified: Boolean
    isPhoneVerified: Boolean

    isOnline: Boolean
    lastSeenAt: Date
    sessionCount: Int

    clientPortal: ClientPortal

    ${
      isContactsEnabled
        ? `
        customer: Customer
        company: Company
      `
        : ''
    }
  }

  type clientPortalUsersListResponse {
    list: [ClientPortalUser],
    totalCount: Float,
  }
`;

export const conformityQueryFields = `
  conformityMainType: String
  conformityMainTypeId: String
  conformityRelType: String
  conformityIsRelated: Boolean
  conformityIsSaved: Boolean
`;

const queryParams = `
  page: Int
  perPage: Int
  type: String
  ids: [String]
  excludeIds: Boolean
  searchValue: String
  sortField: String
  sortDirection: Int
  cpId: String
  dateFilters: String
  ${conformityQueryFields}
`;

export const queries = () => `
  clientPortalCurrentUser: ClientPortalUser
  clientPortalUserDetail(_id: String!): ClientPortalUser
  clientPortalUsers(${queryParams}): [ClientPortalUser]
  clientPortalUsersMain(${queryParams}): clientPortalUsersListResponse
  clientPortalUserCounts(type: String): Int
`;

const userParams = `
  clientPortalId: String
  phone: String,
  email: String,
  username: String,
  password: String,

  companyName: String
  companyRegistrationNumber: String
  
  firstName: String,
  lastName: String,
  code: String,
  ownerId: String,
  links: JSON,
  customFieldsData: JSON,
  
  type: String,
`;

export const mutations = () => `
  clientPortalUsersInvite(${userParams}): ClientPortalUser
  clientPortalUsersEdit(_id: String!, ${userParams}): ClientPortalUser
  clientPortalUsersRemove(clientPortalUserIds: [String!]): JSON
  clientPortalRegister(${userParams}): String
  clientPortalVerifyOTP(userId: String!, phoneOtp: String, emailOtp: String, password: String): String
  clientPortalUsersVerify(userIds: [String]!, type: String): JSON
  clientPortalLogin(login: String!, password: String!, clientPortalId: String!, deviceToken: String): String
  clientPortalLogout: String

  clientPortalConfirmInvitation(token: String, password: String, passwordConfirmation: String, username: String): ClientPortalUser
  clientPortalForgotPassword(clientPortalId: String!, email: String, phone: String): String!
  clientPortalResetPasswordWithCode(phone: String!, code: String!, password: String!): String
  clientPortalResetPassword(token: String!, newPassword: String!): JSON
  clientPortalUserChangePassword(currentPassword: String!, newPassword: String!): ClientPortalUser
`;
