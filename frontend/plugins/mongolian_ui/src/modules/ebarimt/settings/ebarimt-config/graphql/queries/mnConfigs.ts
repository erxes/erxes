import { gql } from '@apollo/client';

export const GET_MN_CONFIGS = gql`
  query mnConfigs($code: String!) {
    mnConfigs(code: $code) {
      _id
      code
      subId
      value
    }
  }
`;

