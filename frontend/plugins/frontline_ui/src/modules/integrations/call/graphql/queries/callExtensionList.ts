import { gql } from '~/gql';

export const CALL_EXTENSION_LIST = gql(`
  query CallExtensionList($integrationId: String!) {
    callExtensionList(integrationId: $integrationId) {
      extension
      fullname
      status
    }
  }
`);
