const commonParamsDef = `
  $username: String,
  $email: String,
  $details: UserDetails,
  $links: JSON,
  $channelIds: [String]
  $groupIds: [String]
  $brandIds: [String]
  $customFieldsData: JSON
`;

const commonParams = `
  username: $username,
  email: $email,
  details: $details,
  links: $links,
  channelIds: $channelIds
  groupIds: $groupIds
  brandIds: $brandIds
  customFieldsData: $customFieldsData
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
    $links: JSON 
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
  mutation usersInvite($entries: [InvitationEntry]) {
    usersInvite(entries: $entries)
  }
`;

const usersResendInvitation = `
  mutation usersResendInvitation($email: String!) {
    usersResendInvitation(email: $email)
  }
`;

const usersSetActiveStatus = `
  mutation usersSetActiveStatus($_id: String!) {
    usersSetActiveStatus(_id: $_id) {
      _id
    }
  }
`;

const usersConfirmInvitation = `
  mutation usersConfirmInvitation($token: String, $password: String, $passwordConfirmation: String, $fullName: String, $username: String) {
    usersConfirmInvitation(token: $token, password: $password, passwordConfirmation: $passwordConfirmation, fullName: $fullName, username: $username) {
      _id
    }
  }
`;

const usersResetMemberPassword = `
  mutation usersResetMemberPassword($_id: String!, $newPassword: String!) {
    usersResetMemberPassword(_id: $_id, newPassword: $newPassword) {
      _id
    }
  }
`;

const userExcludeSkill = `
  mutation excludeUserSkill($_id: String!, $memberIds: [String]!) {
    excludeUserSkill(_id: $_id, memberIds: $memberIds)
  }
`;

const userAddSkill = `
  mutation addUserSkills($memberId: String!, $skillIds: [String]!) {
    addUserSkills(memberId: $memberId, skillIds: $skillIds)
  }
`;

export default {
  usersEditProfile,
  usersEdit,
  usersInvite,
  usersResendInvitation,
  usersConfirmInvitation,
  usersSetActiveStatus,
  usersResetMemberPassword,
  userAddSkill,
  userExcludeSkill
};
