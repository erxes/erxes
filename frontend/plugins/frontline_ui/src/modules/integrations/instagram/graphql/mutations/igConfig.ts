import { gql } from '@apollo/client';

export const INSTAGRAM_UPDATE_CONFIGS = gql`
  mutation InstagramUpdateConfigs($configsMap: JSON!) {
    instagramUpdateConfigs(configsMap: $configsMap)
  }
`;

export const INSTAGRAM_REPAIR = gql`
  mutation InstagramRepair($_id: String!, $kind: String!) {
    integrationsRepair(_id: $_id, kind: $kind)
  }
`;
