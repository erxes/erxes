import { gql } from '~/gql';

export const GET_INTEGRATIONS = gql(`
  query FacebookGetIntegrations($kind: String) {
    facebookGetIntegrations(kind: $kind) {
      _id
      erxesApiId
      accountId
      facebookPageIds
    }
  }
`);
