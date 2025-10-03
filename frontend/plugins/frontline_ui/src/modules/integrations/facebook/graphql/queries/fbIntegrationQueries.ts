import { gql } from '@apollo/client';

export const GET_INTEGRATIONS = gql`
  query FacebookGetIntegrations($kind: String) {
    facebookGetIntegrations(kind: $kind)
  }
`;

export const GET_INTEGRATION_DETAIL = gql`
  query FacebookGetIntegrationDetail($erxesApiId: String) {
    facebookGetIntegrationDetail(erxesApiId: $erxesApiId)
  }
`;

export const GET_PAGES = gql`
  query FacebookGetPages($accountId: String!, $kind: String!) {
    facebookGetPages(accountId: $accountId, kind: $kind)
  }
`;

export const GET_ACCOUNTS = gql`
  query FacebookGetAccounts($kind: String) {
    facebookGetAccounts(kind: $kind)
  }
`;
