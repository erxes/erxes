import { gql } from '@apollo/client';

export const CP_USERS_EDIT = gql`
  mutation cpUsersEdit(
    $_id: String!
    $firstName: String
    $lastName: String
    $avatar: String
    $username: String
    $companyName: String
    $companyRegistrationNumber: String
  ) {
    cpUsersEdit(
      _id: $_id
      firstName: $firstName
      lastName: $lastName
      avatar: $avatar
      username: $username
      companyName: $companyName
      companyRegistrationNumber: $companyRegistrationNumber
    ) {
      _id
      firstName
      lastName
      username
      companyName
      companyRegistrationNumber
      updatedAt
    }
  }
`;
