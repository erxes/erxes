import { gql } from '@apollo/client';

export const MAIL_VERIFIED_CONTACTS_QUERY = gql`
  query frontlineMailVerifiedContacts($searchValue: String, $cursor: String) {
    customers(searchValue: $searchValue, cursor: $cursor, limit: 100) {
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
