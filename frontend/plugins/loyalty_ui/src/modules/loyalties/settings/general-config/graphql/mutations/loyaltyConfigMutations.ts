import { gql } from '@apollo/client';

export const UPDATE_LOYALTY_CONFIG = gql`
  mutation LoyaltyConfigsUpdate($configsMap: JSON!) {
    loyaltyConfigsUpdate(configsMap: $configsMap)
  }
`;
