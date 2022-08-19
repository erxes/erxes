const clientPortalLogin = `
  mutation clientPortalLogin(
    $clientPortalId: String!
    $email: String!,
    $password: String!,
  ) {
    clientPortalLogin(
      clientPortalId: $clientPortalId,
      login: $email,
      password: $password,
    )
  }
`;

const createUser = `
  mutation clientPortalRegister(
    $clientPortalId: String!
    $password: String,
    $email: String,
    $firstName: String,
    $lastName: String,
    $phone: String,
    $type: String,
  ) {
    clientPortalRegister(
      clientPortalId: $clientPortalId
      email: $email,
      password: $password,
      firstName: $firstName,
      lastName: $lastName,
      phone: $phone,
      type: $type,
    )
  }
`;

const logout = `
  mutation {
    clientPortalLogout
  }
`;

const getCode = `
  mutation sendVerificationCode($phone: String!) {
    sendVerificationCode(phone: $phone)
  }
`;
const resetPassword = `
  mutation resetPasswordWithCode(
    $phone: String!,
    $password: String!,
    $code: String!,
  ) {
    resetPasswordWithCode(
      phone: $phone,
      password: $password,
      code: $code,
    )
  }
`;

export default {
  login: clientPortalLogin,
  logout,
  createUser,
  getCode,
  resetPassword
};
