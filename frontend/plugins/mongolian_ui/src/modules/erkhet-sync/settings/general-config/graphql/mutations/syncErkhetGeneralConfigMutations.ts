import { gql } from '@apollo/client';

export const UPDATE_ERKHET_SYNC_GENERAL_CONFIG = gql`
  mutation configsUpdate($configsMap: JSON!) {
    configsUpdate(configsMap: $configsMap)
  }
`;
