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
    $companyName: String
    $phone: String,
    $type: String,
  ) {
    clientPortalRegister(
      clientPortalId: $clientPortalId
      email: $email,
      password: $password,
      firstName: $firstName,
      lastName: $lastName,
      companyName: $companyName
      phone: $phone,
      type: $type,
    )
  }
`;

const userEdit = `
  mutation clientPortalUsersEdit(
    $_id: String!,
    $clientPortalId: String,
    $email: String,
    $firstName: String,
    $lastName: String,
    $phone: String,
    $username: String,
    $avatar: String,
    $companyName: String
  ) {
    clientPortalUsersEdit(
      _id: $_id,
      clientPortalId: $clientPortalId,
      email: $email,
      firstName: $firstName,
      lastName: $lastName,
      phone: $phone,
      username: $username,
      avatar: $avatar,
      companyName: $companyName,
    ) {
      _id
      email
    }
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

const forgotPassword = `
  mutation clientPortalForgotPassword(
    $clientPortalId: String!,
    $email: String,
    $phone: String,
  ) {
    clientPortalForgotPassword(
      clientPortalId: $clientPortalId,
      email: $email,
      phone: $phone,
    )
  }
`;

const resetPassword = `
  mutation clientPortalResetPassword(
    $token: String!,
    $newPassword: String!,
  ) {
    clientPortalResetPassword(
      token: $token,
      newPassword: $newPassword,
    )
  }
`;

const googleLogin = `
  mutation clientPortalGoogleAuthentication(
    $code: String!,
    $clientPortalId: String!,
  ) {
    clientPortalGoogleAuthentication(
      clientPortalId: $clientPortalId,
      code: $code,
    )
  }
`;

const facebookLogin = `
 mutation ClientPortalFaceBookAuthentication($accessToken: String!, $clientPortalId: String!) {
  clientPortalFacebookAuthentication(accessToken: $accessToken, clientPortalId: $clientPortalId)
}
`;

export default {
  login: clientPortalLogin,
  logout,
  createUser,
  userEdit,
  getCode,
  forgotPassword,
  resetPassword,
  googleLogin,
  facebookLogin
};
