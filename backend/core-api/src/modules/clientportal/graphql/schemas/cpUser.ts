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
  }

`;

const userParams = `
  phone: String,
  email: String,
  username: String,
  password: String,
  secondaryPassword: String,

  companyName: String
  companyRegistrationNumber: String
  erxesCompanyId: String
  
  firstName: String,
  lastName: String,
  code: String,
  ownerId: String,
  links: JSON,
  customFieldsData: JSON,
  
  type: String,
  avatar: String
`;

export const mutations = `
  clientPortalRegister(${userParams}): String
`;
