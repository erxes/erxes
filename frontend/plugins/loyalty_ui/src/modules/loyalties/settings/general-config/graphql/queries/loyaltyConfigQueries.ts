import { gql } from '@apollo/client';

export const LOYALTY_CONFIGS_QUERY = gql`
  query loyaltyConfigs {
    loyaltyConfigs {
      _id
      code
      value
      __typename
    }
  }
`;
