import { gql } from '@apollo/client';

export const ACCOUNTINGS_MAIN_CONFIGS_UPDATE = gql`
  mutation accountingsConfigsUpdateByCode($configsMap: JSON!) {
    accountingsConfigsUpdateByCode(configsMap: $configsMap)
  }
`;

export const ACCOUNTINGS_CONFIGS_ADD = gql`
  mutation accountingsConfigsCreate($code: String!, $subId: String, $value: JSON) {
    accountingsConfigsCreate(code: $code, subId: $subId, value: $value) {
      _id
      code
      subId
      value
    }
  }
`;

export const ACCOUNTINGS_CONFIGS_EDIT = gql`
  mutation accountingsConfigsUpdate($_id: String!, $subId: String, $value: JSON) {
    accountingsConfigsUpdate(_id: $_id, subId: $subId, value: $value) {
      _id
      code
      subId
      value
    }
  }
`;
