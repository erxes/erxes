import { gql } from '@apollo/client';

const UPDATE_CONFIGS = gql`
  mutation configsUpdate($configsMap: JSON!) {
    configsUpdate(configsMap: $configsMap)
  }
`;

export const fileSettingsMutations = {
  UPDATE_CONFIGS,
};
