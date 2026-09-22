import { gql } from '@apollo/client';

export const MN_CONFIGS = gql`
  query productPlacesMnConfigs($code: String!) {
    mnConfigs(code: $code) {
      _id
      code
      subId
      value
    }
  }
`;
