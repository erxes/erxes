const commonParamsDef = `
  $username: String!,
  $email: String!,
  $role: String!
  $details: UserDetails,
  $links: UserLinks,
  $channelIds: [String],
  $password: String!,
  $passwordConfirmation: String!
`;

const commonParams = `
  username: $username,
  email: $email,
  role: $role,
  details: $details,
  links: $links,
  channelIds: $channelIds,
  password: $password,
  passwordConfirmation: $passwordConfirmation
`;

const usersEdit = `
  mutation usersEdit($_id: String!, ${commonParamsDef}) {
    usersEdit(_id: $_id, ${commonParams}) {
      _id
    }
  }
`;

export default { usersEdit };
