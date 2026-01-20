import { gql } from '@apollo/client';

export const GET_IG_ACCOUNTS = gql`
  query instagramGetAccounts($kind: String) {
    instagramGetAccounts(kind: $kind)
  }
`;

export const GET_IG_PAGES = gql`
  query instagramGetPages($accountId: String!, $kind: String!) {
    instagramGetPages(accountId: $accountId, kind: $kind)
  }
`;
