import { gql } from '@apollo/client';

export const MN_CONFIG = gql`
  query MnConfig($code: String!, $subId: String) {
    mnConfig(code: $code, subId: $subId) {
      _id
      code
      subId
      value
    }
  }
`;
