import { gql } from '@apollo/client';

export const UPDATE_EBARIMT_CONFIG = gql`
  mutation configsUpdate($configsMap: JSON!) {
    configsUpdate(configsMap: $configsMap)
  }
`;
