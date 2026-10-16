import { gql } from '~/gql';

export const INSTAGRAM_UPDATE_CONFIGS = gql(`
  mutation InstagramUpdateConfigs($configsMap: JSON!) {
    instagramUpdateConfigs(configsMap: $configsMap)
  }
`);

export const INSTAGRAM_REPAIR = gql(`
  mutation InstagramRepair($_id: String!) {
    instagramRepair(_id: $_id)
  }
`);
