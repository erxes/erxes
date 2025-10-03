import { gql } from '@apollo/client';

export const CALL_EXTENSION_LIST = gql`
  query CallExtensionList($integrationId: String!) {
    callExtensionList(integrationId: $integrationId)
  }
`;
