import { gql } from '~/gql';

export const GET_MN_CONFIGS = gql(`
  query mongolianMnConfigs($code: String!) {
    mnConfigs(code: $code) {
      _id
      code
      subId
      value
    }
  }
`);

export const CREATE_MN_CONFIG = gql(`
  mutation mongolianMnConfigsCreate($code: String!, $subId: String, $value: JSON) {
    mnConfigsCreate(code: $code, subId: $subId, value: $value) {
      _id
      code
      subId
      value
    }
  }
`);

export const UPDATE_MN_CONFIG = gql(`
  mutation mongolianMnConfigsUpdate($id: String!, $subId: String, $value: JSON) {
    mnConfigsUpdate(_id: $id, subId: $subId, value: $value) {
      _id
      code
      subId
      value
    }
  }
`);

export const REMOVE_MN_CONFIG = gql(`
  mutation mongolianMnConfigsRemove($id: String!) {
    mnConfigsRemove(_id: $id)
  }
`);
