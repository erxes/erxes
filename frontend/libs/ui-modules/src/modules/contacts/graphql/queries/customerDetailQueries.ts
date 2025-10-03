import { gql } from '@apollo/client';

export const CUSTOMER_DETAIL = gql`
  query CustomerDetail($_id: String!) {
    customerDetail(_id: $_id) {
      _id
      avatar
      firstName
      lastName
      middleName
      description
      position
      isSubscribed
      department
      leadStatus
      sex
      email
      emailValidationStatus
      emails
      tagIds
      ownerId
      phone
      phoneValidationStatus
      phones
      primaryEmail
      primaryPhone
      score
      code
      companies {
        _id
        avatar
        primaryName
      }
      __typename
    }
  }
`;

export const CUSTOMER_INLINE = gql`
  query CustomerInline($_id: String!) {
    customerDetail(_id: $_id) {
      _id
      firstName
      lastName
      primaryEmail
      primaryPhone
      avatar
    }
  }
`;
