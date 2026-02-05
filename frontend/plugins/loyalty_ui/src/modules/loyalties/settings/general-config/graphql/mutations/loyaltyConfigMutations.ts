import { gql } from '@apollo/client';

export const UPDATE_LOYALTY_CONFIG = gql`
  mutation configsUpdate($configsMap: JSON!) {
    configsUpdate(configsMap: $configsMap)
  }
`;
