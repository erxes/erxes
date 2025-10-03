import { gql } from '@apollo/client';

export const ACCOUNTINGS_CONFIGS_UPDATE = gql`
  mutation accountingsConfigsUpdate($configsMap: JSON!) {
    accountingsConfigsUpdate(configsMap: $configsMap)
  }
`;
