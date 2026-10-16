import { gql } from '~/gql';

export const HELP_CENTER_CONFIG_UPDATE = gql(`
  mutation helpCenterConfigUpdate($config: HelpCenterConfigInput!) {
    helpCenterConfigUpdate(config: $config) {
      ...HelpCenterConfigFields
    }
  }
`);

export const HELP_CENTER_CONFIG_REMOVE = gql(`
  mutation helpCenterConfigRemove($_id: String!) {
    helpCenterConfigRemove(_id: $_id)
  }
`);
