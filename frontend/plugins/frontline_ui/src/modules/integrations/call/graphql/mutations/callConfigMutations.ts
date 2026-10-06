import { gql } from '@apollo/client';

export const UPDATE_CALL_CONFIGS = gql`
  mutation callsUpdateConfigs($configsMap: JSON!) {
    callsUpdateConfigs(configsMap: $configsMap)
  }
`;
