export const types = `

`;

export const queries = `
  userDetail(_id: String!): User
  currentUser: User
`;

const userParams = `
  password: String!,
  email: String,
  firstName: String,
  lastName: String,
  phone: String,
  type: String,
  companyName: String,
  companyRegistrationNumber: Int,
`;

export const mutations = `
  login(email: String!, password: String!, type: String, description: String, deviceToken: String): String
  logout: String
  forgotPassword(email: String!): String!
  resetPasswordWithCode(phone: String!, code: String!, password: String!): String
  resetPassword(token: String!, newPassword: String!): JSON
  userAdd(${userParams}): String
  userEdit(_id: String!, ${userParams}): User
  userChangePassword(currentPassword: String!, newPassword: String!): User
  sendVerificationCode(phone: String!): String!
`;
