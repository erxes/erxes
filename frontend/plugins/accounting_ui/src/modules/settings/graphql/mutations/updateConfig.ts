import { gql } from '@apollo/client';

export const ACCOUNTINGS_MAIN_CONFIGS_UPDATE = gql`
  mutation accountingsConfigsUpdateByCode($configsMap: JSON!) {
    accountingsConfigsUpdateByCode(configsMap: $configsMap)
  }
`;
