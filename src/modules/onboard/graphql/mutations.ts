const commonParamsDef = `
  $username: String!,
  $email: String!,
  $role: String!
  $password: String!,
  $passwordConfirmation: String!
`;

const commonParams = `
  username: $username,
  email: $email,
  role: $role,
  password: $password,
  passwordConfirmation: $passwordConfirmation
`;

const usersAdd = `
  mutation usersAdd(${commonParamsDef}) {
    usersAdd(${commonParams}) {
      _id
    }
  }
`;

const usersRemove = `
  mutation usersRemove($_id: String!) {
    usersRemove(_id: $_id)
  }
`;

export default { usersAdd, usersRemove };
