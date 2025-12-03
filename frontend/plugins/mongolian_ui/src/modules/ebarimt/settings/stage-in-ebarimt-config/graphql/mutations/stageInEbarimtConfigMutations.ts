import { gql } from '@apollo/client';

export const CREATE_STAGE_IN_EBARIMT_CONFIG = gql`
  mutation configsUpdate($configsMap: JSON!) {
    configsUpdate(configsMap: $configsMap)
  }
`;
