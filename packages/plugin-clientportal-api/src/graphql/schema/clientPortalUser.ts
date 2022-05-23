export const types = contactsAvailable => `
  ${
    contactsAvailable
      ? `
      extend type Customer @key(fields: "_id") {
        _id: String! @external
      }
    `
      : ''
  }

  type ClientPortalUser {
    _id: String!
    firstName: String
    lastName: String
    phone: String
    email: String
    username: String
    type: String
    erxesCustomerId: String
    ${
      contactsAvailable
        ? `
          customerDetail: Customer
        `
        : ''
    }
  }
`;

export const queries = () => `
  clientPortalCurrentUser: ClientPortalUser
  clientPortalUserDetail(_id: String!): ClientPortalUser
`;

const userParams = `
  clientPortalId: String!
  phone: String,
  email: String,
  username: String,
  password: String,
  
  firstName: String,
  lastName: String,
  
  type: String,
`;

export const mutations = () => `
  clientPortalRegister(${userParams}): String
  clientPortalVerifyOTP(userId: String!, phoneOtp: String, emailOtp: String): String
  clientPortalLogin(login: String!, password: String!, clientPortalId: String!, deviceToken: String): String
  clientPortalLogout: String

  clientPortalForgotPassword(clientPortalId: String!, email: String, phone: String): String!
  clientPortalResetPasswordWithCode(phone: String!, code: String!, password: String!): String
  clientPortalResetPassword(token: String!, newPassword: String!): JSON
  clientPortalUserChangePassword(currentPassword: String!, newPassword: String!): ClientPortalUser
`;
