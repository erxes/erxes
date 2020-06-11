const login = `
  mutation login($email: String!, $password: String!) {
    login(email: $email, password: $password)
  }
`;

const forgotPassword = `
  mutation forgotPassword($email: String!) {
    forgotPassword(email: $email)
  }
`;

const resetPassword = `
  mutation resetPassword($token: String!, $newPassword: String!) {
    resetPassword(token: $token, newPassword: $newPassword)
  }
`;

export default {
  login,
  forgotPassword,
  resetPassword
};
