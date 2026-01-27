import { gql } from '@apollo/client';

export const GET_MN_CONFIGS = gql`
  query MnConfigs($code: String!) {
    mnConfigs(code: $code) {
      _id
      code
      subId
      value
    }
  }
`;

export const CREATE_MN_CONFIG = gql`
  mutation MnConfigsCreate($code: String!, $subId: String, $value: JSON) {
    mnConfigsCreate(code: $code, subId: $subId, value: $value) {
      _id
      code
      subId
      value
    }
  }
`;

export const UPDATE_MN_CONFIG = gql`
  mutation MnConfigsUpdate($id: String!, $subId: String, $value: JSON) {
    mnConfigsUpdate(_id: $id, subId: $subId, value: $value) {
      _id
      code
      subId
      value
    }
  }
`;

export const REMOVE_MN_CONFIG = gql`
  mutation MnConfigsRemove($id: String!) {
    mnConfigsRemove(_id: $id)
  }
`;
