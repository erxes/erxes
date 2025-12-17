import { gql } from '@apollo/client';

export const CREATE_EBARIMT_RETURN_CONFIG = gql`
  mutation configsUpdate($configsMap: JSON!) {
    configsUpdate(configsMap: $configsMap)
  }
`;
