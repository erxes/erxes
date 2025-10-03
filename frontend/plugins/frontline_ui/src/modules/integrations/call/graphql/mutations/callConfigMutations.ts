import { gql } from '@apollo/client';

export const UPDATE_CALL_CONFIGS = gql`
  mutation callsUpdateConfigs($configsMap: JSON!) {
    callsUpdateConfigs(configsMap: $configsMap)
  }
`;

export const CALL_INTEGRATION_UPDATE = gql`
  mutation callsUpdateIntegration($configsMap: JSON!) {
    callsUpdateIntegration(configsMap: $configsMap)
  }
`;
