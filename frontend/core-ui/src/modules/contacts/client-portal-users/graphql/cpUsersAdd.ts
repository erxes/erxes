import { gql } from '@apollo/client';

export const CP_USERS_ADD = gql`
  mutation cpUsersAdd(
    $clientPortalId: String!
    $email: String
    $phone: String
    $username: String
    $password: String
    $firstName: String
    $lastName: String
    $userType: CPUserType
  ) {
    cpUsersAdd(
      clientPortalId: $clientPortalId
      email: $email
      phone: $phone
      username: $username
      password: $password
      firstName: $firstName
      lastName: $lastName
      userType: $userType
    ) {
      _id
      email
      phone
      firstName
      lastName
      type
      clientPortalId
      isVerified
      createdAt
    }
  }
`;
