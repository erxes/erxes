import { gql } from '@apollo/client';

export const CUSTOMERS_ADD = gql`
  mutation CustomersAdd(
    $avatar: String
    $firstName: String
    $lastName: String
    $primaryEmail: String
    $primaryPhone: String
    $ownerId: String
    $description: String
    $isSubscribed: String
    $code: String
    $emailValidationStatus: String
    $phoneValidationStatus: String
    $state: String
  ) {
    customersAdd(
      avatar: $avatar
      firstName: $firstName
      lastName: $lastName
      primaryEmail: $primaryEmail
      primaryPhone: $primaryPhone
      ownerId: $ownerId
      description: $description
      isSubscribed: $isSubscribed
      code: $code
      emailValidationStatus: $emailValidationStatus
      phoneValidationStatus: $phoneValidationStatus
      state: $state
    ) {
      _id
    }
  }
`;
