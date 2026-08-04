import { gql } from '@apollo/client';

export const GET_INTEGRATIONS = gql`
  query InstagramGetIntegrations($kind: String) {
    instagramGetIntegrations(kind: $kind)
  }
`;

export const GET_INTEGRATION_DETAIL = gql`
  query InstagramGetIntegrationDetail($erxesApiId: String) {
    instagramGetIntegrationDetail(erxesApiId: $erxesApiId)
  }
`;

export const GET_PAGES = gql`
  query InstagramGetPages($accountId: String!, $kind: String!) {
    instagramGetPages(accountId: $accountId, kind: $kind)
  }
`;

export const GET_ACCOUNTS = gql`
  query InstagramGetAccounts($kind: String) {
    instagramGetAccounts(kind: $kind)
  }
`;
