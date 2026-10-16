import { gql } from '~/gql';

export const UPDATE_CALL_CONFIGS = gql(`
  mutation callsUpdateConfigs($configsMap: JSON!) {
    callsUpdateConfigs(configsMap: $configsMap)
  }
`);
