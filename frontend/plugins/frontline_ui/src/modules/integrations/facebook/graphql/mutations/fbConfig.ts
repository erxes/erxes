import { gql } from '@apollo/client';

export const FACEBOOK_UPDATE_CONFIGS = gql`
  mutation FacebookUpdateConfigs($configsMap: JSON!) {
    facebookUpdateConfigs(configsMap: $configsMap)
  }
`;
