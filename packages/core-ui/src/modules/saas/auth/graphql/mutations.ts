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

const createOwner = `
  mutation usersCreateOwner($email: String!, $password: String!, $firstName: String!, $lastName: String, $purpose: String, $subscribeEmail: Boolean) {
    usersCreateOwner(email: $email, password: $password, firstName: $firstName, lastName: $lastName, purpose: $purpose, subscribeEmail: $subscribeEmail)
  }
`;

const loginWithGoogle = `
  mutation loginWithGoogle {
    loginWithGoogle
  }
`;

const loginWithMagicLink = `
  mutation loginWithMagicLink($email: String!) {
    loginWithMagicLink(email: $email)
  }
`;

export default {
  login,
  forgotPassword,
  resetPassword,
  createOwner,
  loginWithGoogle,
  loginWithMagicLink,
};
