import { gql } from '@apollo/client';

export const ADD_CUSTOMERS = gql`
  mutation customersAdd(
    $avatar: String
    $firstName: String
    $lastName: String
    $middleName: String
    $primaryEmail: String
    $primaryPhone: String
    $ownerId: String
    $description: String
    $isSubscribed: String
    $links: JSON
    $code: String
    $emailValidationStatus: String
    $phoneValidationStatus: String
    $state: String
  ) {
    customersAdd(
      avatar: $avatar
      firstName: $firstName
      lastName: $lastName
      middleName: $middleName
      primaryEmail: $primaryEmail
      primaryPhone: $primaryPhone
      ownerId: $ownerId
      description: $description
      isSubscribed: $isSubscribed
      links: $links
      code: $code
      emailValidationStatus: $emailValidationStatus
      phoneValidationStatus: $phoneValidationStatus
      state: $state
    ) {
      _id
    }
  }
`;
