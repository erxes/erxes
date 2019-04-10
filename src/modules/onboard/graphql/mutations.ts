const commonParamsDef = `
  $username: String!,
  $email: String!,
  $password: String!,
  $passwordConfirmation: String!
`;

const commonParams = `
  username: $username,
  email: $email,
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

const usersInvite = `
  mutation usersInvite($emails: [String]) {
    usersInvite(emails: $emails)
  }
`;

const userSeenOnboard = `
  mutation {
    usersSeenOnBoard {
      _id
    }
  }
`;

export default { usersAdd, usersRemove, usersInvite, userSeenOnboard };
