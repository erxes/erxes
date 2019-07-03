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

const usersStatusChange = `
  mutation usersSetActiveStatus($_id: String!) {
    usersSetActiveStatus(_id: $_id) {
      _id
    }
  }
`;

const usersInvite = `
  mutation usersInvite($entries: [InvitationEntry]) {
    usersInvite(entries: $entries)
  }
`;

const userSeenOnboard = `
  mutation {
    usersSeenOnBoard {
      _id
    }
  }
`;

export default { usersAdd, usersInvite, userSeenOnboard, usersStatusChange };
