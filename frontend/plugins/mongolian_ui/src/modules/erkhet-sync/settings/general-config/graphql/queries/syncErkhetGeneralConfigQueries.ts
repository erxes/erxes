import { gql } from '@apollo/client';

export const GET_ERKHET_SYNC_GENERAL_CONFIG = gql`
  query mnConfigs($code: String!) {
    mnConfigs(code: $code) {
      _id
      code
      subId
      value
    }
  }
`;
