import { gql } from '@apollo/client';

export const CP_USERS_EDIT = gql`
  mutation cpUsersEdit(
    $_id: String!
    $email: String
    $phone: String
    $firstName: String
    $lastName: String
    $avatar: String
    $username: String
    $companyName: String
    $companyRegistrationNumber: String
    $erxesCustomerId: String
    $erxesCompanyId: String
  ) {
    cpUsersEdit(
      _id: $_id
      email: $email
      phone: $phone
      firstName: $firstName
      lastName: $lastName
      avatar: $avatar
      username: $username
      companyName: $companyName
      companyRegistrationNumber: $companyRegistrationNumber
      erxesCustomerId: $erxesCustomerId
      erxesCompanyId: $erxesCompanyId
    ) {
      _id
      email
      phone
      firstName
      lastName
      username
      companyName
      companyRegistrationNumber
      erxesCustomerId
      erxesCompanyId
      updatedAt
    }
  }
`;
