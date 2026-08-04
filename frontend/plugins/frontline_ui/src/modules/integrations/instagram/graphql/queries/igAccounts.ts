import { gql } from '@apollo/client';

export const GET_IG_ACCOUNTS = gql`
  query InstagramGetAccounts($kind: String) {
    instagramGetAccounts(kind: $kind)
  }
`;

export const GET_IG_PAGES = gql`
  query InstagramGetPages($accountId: String!, $kind: String!) {
    instagramGetPages(accountId: $accountId, kind: $kind)
  }
`;
