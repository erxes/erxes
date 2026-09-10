import { gql } from '@apollo/client';
import { HELP_CENTER_CONFIG_FIELDS } from '@/helpcenter/graphql/queries/getHelpCenters';

export const HELP_CENTER_CONFIG_UPDATE = gql`
  ${HELP_CENTER_CONFIG_FIELDS}
  mutation helpCenterConfigUpdate($config: HelpCenterConfigInput!) {
    helpCenterConfigUpdate(config: $config) {
      ...HelpCenterConfigFields
    }
  }
`;

export const HELP_CENTER_CONFIG_REMOVE = gql`
  mutation helpCenterConfigRemove($_id: String!) {
    helpCenterConfigRemove(_id: $_id)
  }
`;
