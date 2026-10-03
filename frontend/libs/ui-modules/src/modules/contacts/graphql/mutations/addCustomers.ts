import { gql } from '@apollo/client';

export const CUSTOMERS_ADD = gql`
  mutation CustomersAdd(
    $avatar: String
    $firstName: String
    $lastName: String
    $middleName: String
    $position: String
    $department: String
    $leadStatus: String
    $hasAuthority: String
    $sex: Int
    $primaryEmail: String
    $primaryPhone: String
    $ownerId: String
    $description: String
    $isSubscribed: String
    $code: String
    $emailValidationStatus: String
    $phoneValidationStatus: String
    $state: String
    $propertiesData: JSON
    $birthDate: Date
  ) {
    customersAdd(
      avatar: $avatar
      firstName: $firstName
      lastName: $lastName
      middleName: $middleName
      position: $position
      department: $department
      leadStatus: $leadStatus
      hasAuthority: $hasAuthority
      sex: $sex
      primaryEmail: $primaryEmail
      primaryPhone: $primaryPhone
      ownerId: $ownerId
      description: $description
      isSubscribed: $isSubscribed
      code: $code
      emailValidationStatus: $emailValidationStatus
      phoneValidationStatus: $phoneValidationStatus
      state: $state
      propertiesData: $propertiesData
      birthDate: $birthDate
    ) {
      _id
    }
  }
`;
