import { gql } from '@apollo/client';

export const UPDATE_CONFIGS = gql`
  mutation ConfigsUpdate($configsMap: JSON!) {
    configsUpdate(configsMap: $configsMap)
  }
`;
