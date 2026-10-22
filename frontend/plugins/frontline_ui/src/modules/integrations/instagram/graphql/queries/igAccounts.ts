import { gql } from '~/gql';

export const GET_IG_ACCOUNTS = gql(`
  query InstagramGetAccounts($kind: String) {
    instagramGetAccounts(kind: $kind) {
      _id
      name
    }
  }
`);

export const GET_IG_PAGES = gql(`
  query InstagramGetPages($accountId: String!, $kind: String!) {
    instagramGetPages(accountId: $accountId, kind: $kind) {
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
