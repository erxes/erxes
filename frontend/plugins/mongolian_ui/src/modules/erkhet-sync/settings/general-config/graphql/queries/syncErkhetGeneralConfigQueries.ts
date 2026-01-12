import { gql } from '@apollo/client';

export const GET_ERKHET_SYNC_GENERAL_CONFIG = gql`
  query configsGetValue($code: String!) {
    configsGetValue(code: $code)
  }
`;
