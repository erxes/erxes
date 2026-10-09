import { gql } from '@apollo/client';

export const MAIL_UNVERIFIED_RECIPIENTS_QUERY = gql`
  query frontlineMailUnverifiedRecipients($emails: [String!]!) {
    mailUnverifiedRecipients(emails: $emails)
  }
`;

export const MAIL_VERIFIED_CONTACTS_QUERY = gql`
  query frontlineMailVerifiedContacts($searchValue: String, $cursor: String) {
    customers: mailVerifiedContacts(
      searchValue: $searchValue
      cursor: $cursor
    ) {
      list {
        _id
        firstName
        lastName
        primaryEmail
        emails
        emailValidationStatus
      }
      pageInfo {
        endCursor
        hasNextPage
      }
    }
  }
`;
