import { gql } from '@apollo/client';

export const HRM_CONFIGS_UPDATE_BY_CODE = gql`
  mutation hrmConfigsUpdateByCode($configsMap: JSON!) {
    hrmConfigsUpdateByCode(configsMap: $configsMap)
  }
`;
