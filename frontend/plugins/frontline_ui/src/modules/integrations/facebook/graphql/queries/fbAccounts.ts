import { gql } from '~/gql';

export const GET_FB_ACCOUNTS = gql(`
  query FacebookGetAccounts($kind: String, $integrationKind: String) {
    facebookGetAccounts(kind: $kind, integrationKind: $integrationKind) {
      _id
      name
    }
  }
`);

export const GET_FB_PAGES = gql(`
  query facebookGetPages($accountId: String!, $kind: String!) {
    facebookGetPages(accountId: $accountId, kind: $kind) {
      id
      name
      isUsed
      usage {
        integrationId
        integrationName
        channelId
        channelName
      }
    }
  }
`);
