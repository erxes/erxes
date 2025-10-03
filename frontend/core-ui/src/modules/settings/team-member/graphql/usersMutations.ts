import { gql } from '@apollo/client';

const USERS_INVITE = gql`
  mutation usersInvite($entries: [InvitationEntry]) {
    usersInvite(entries: $entries)
  }
`;

const USERS_RESEND_INVITATION = gql`
  mutation usersResendInvitation($email: String!) {
    usersResendInvitation(email: $email)
  }
`;

const USERS_SET_ACTIVE_STATUS = gql`
  mutation usersSetActiveStatus($_id: String!) {
    usersSetActiveStatus(_id: $_id) {
      _id
    }
  }
`;

const USERS_CONFIRM_INVITATION = gql`
  mutation usersConfirmInvitation(
    $token: String
    $password: String
    $passwordConfirmation: String
    $fullName: String
    $username: String
  ) {
    usersConfirmInvitation(
      token: $token
      password: $password
      passwordConfirmation: $passwordConfirmation
      fullName: $fullName
      username: $username
    ) {
      _id
    }
  }
`;

const USERS_INLINE_EDIT = gql`
  mutation usersEdit(
    $_id: String!
    $username: String
    $email: String
    $details: UserDetails
    $employeeId: String
    $positionIds: [String]
    $links: JSON
    $branchIds: [String]
    $departmentIds: [String]
  ) {
    usersEdit(
      _id: $_id
      username: $username
      email: $email
      details: $details
      employeeId: $employeeId
      positionIds: $positionIds
      links: $links
      branchIds: $branchIds
      departmentIds: $departmentIds
    ) {
      _id
      username
      email
      positionIds
      details {
        shortName
        birthDate
        workStartedDate
        location
        description
        firstName
        middleName
        lastName
      }
      links
      employeeId
      branchIds
      departmentIds
    }
  }
`;

const USERS_RESET_PASSWORD = gql`
  mutation usersResetMemberPassword($_id: String!, $newPassword: String!) {
    usersResetMemberPassword(_id: $_id, newPassword: $newPassword) {
      _id
    }
  }
`;

const mutations = {
  USERS_CONFIRM_INVITATION,
  USERS_INVITE,
  USERS_RESEND_INVITATION,
  USERS_SET_ACTIVE_STATUS,
  USERS_INLINE_EDIT,
  USERS_RESET_PASSWORD,
};

export default mutations;
