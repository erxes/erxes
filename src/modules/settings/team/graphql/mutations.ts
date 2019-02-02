const commonParamsDef = `
  $username: String!,
  $email: String!,
  $role: String!
  $details: UserDetails,
  $links: UserLinks,
  $channelIds: [String]
`;

const commonParams = `
  username: $username,
  email: $email,
  role: $role,
  details: $details,
  links: $links,
  channelIds: $channelIds
`;

const usersEdit = `
  mutation usersEdit($_id: String!, ${commonParamsDef}) {
    usersEdit(_id: $_id, ${commonParams}) {
      _id
    }
  }
`;

const usersEditProfile = `
  mutation usersEditProfile(
    $username: String!
    $email: String!
    $details: UserDetails
    $links: UserLinks
    $password: String!
  ) {
    usersEditProfile(
      username: $username
      email: $email
      details: $details
      links: $links
      password: $password
    ) {
      _id
    }
  }
`;

const usersInvite = `
  mutation usersInvite($emails: [String]) {
    usersInvite(emails: $emails)
  }
`;

const usersConfirmInvitation = `
  mutation usersConfirmInvitation($email: String, $token: String, $password: String, $passwordConfirmation: String) {
    usersConfirmInvitation(email: $email, token: $token, password: $password, passwordConfirmation: $passwordConfirmation) {
      _id
    }
  }
`;

export default {
  usersEditProfile,
  usersEdit,
  usersInvite,
  usersConfirmInvitation
};
