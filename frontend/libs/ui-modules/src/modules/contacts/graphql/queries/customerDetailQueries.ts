import { gql } from '@apollo/client';

const CONVERSATIONS_FRAGMENT = `
  conversations {
    _id
    assignedUser {
      _id
    }
    content
    messageCount
    integrationId
    messages {
      _id
      attachments {
        name
        size
        type
        url
        duration
      }
      content
    }
  }
`;

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
      ${CONVERSATIONS_FRAGMENT}
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
