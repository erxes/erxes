import { gql } from '@apollo/client';

export const GET_FB_ACCOUNTS = gql`
  query FacebookGetAccounts($kind: String) {
    facebookGetAccounts(kind: $kind)
  }
`;

export const GET_FB_PAGES = gql`
  query facebookGetPages($accountId: String!, $kind: String!) {
    facebookGetPages(accountId: $accountId, kind: $kind)
  }
`;
