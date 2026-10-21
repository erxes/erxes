import { gql } from '~/gql';

// Core's search matches substrings; callers keep only exact email matches.
export const GET_CUSTOMERS_SHARING_EMAIL = gql(`
  query inboxCustomersSharingEmail($searchValue: String) {
    customers(searchValue: $searchValue, limit: 20) {
      list {
        _id
        firstName
        lastName
        primaryEmail
        emails
      }
    }
  }
`);
