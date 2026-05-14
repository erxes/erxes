import { gql } from '@apollo/client';

export const CREATE_PIPELINE_REMAINDER_CONFIG = gql`
  mutation configsUpdate($configsMap: JSON!) {
    configsUpdate(configsMap: $configsMap)
  }
`;
