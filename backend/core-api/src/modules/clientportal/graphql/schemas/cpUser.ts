export const types = `
  type CPUser {
    _id: String!
    email: String
    phone: String
    username: String
    firstName: String
    lastName: String
    companyName: String
    companyRegistrationNumber: String
    erxesCompanyId: String
    erxesCustomerId: String
    clientPortalId: String
    code: String
    ownerId: String
    links: JSON
    customFieldsData: JSON
    customFieldsDataByFieldCode: JSON
    password: String
    isVerified: Boolean
    verificationCode: Int
  }

  enum CPUserType {
    customer
    company
  }
`;

const userRegisterParams = `
  phone: String,
  email: String,
  username: String,
  password: String,
  firstName: String,
  lastName: String,
  type: CPUserType,
`;

export const mutations = `
  clientPortalUserRegister(${userRegisterParams}): CPUser
  clientPortalUserVerify(userId: String!, code: Int!): CPUser
  clientPortalUserLoginWithCredentials(email: String, phone: String, password: String): String
`;
