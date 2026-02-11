import { gql } from '@apollo/client';

export const FACEBOOK_UPDATE_CONFIGS = gql`
  mutation FacebookUpdateConfigs($configsMap: JSON!) {
    facebookUpdateConfigs(configsMap: $configsMap)
  }
`;

export const FACEBOOK_REPAIR = gql`
  mutation FacebookRepair($_id: String!, $kind: String!) {
    integrationsRepair(_id: $_id, kind: $kind)
  }
`;
