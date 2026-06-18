import { gql } from '@apollo/client';

export const UPDATE_ERKHET_SYNC_GENERAL_CONFIG = gql`
  mutation mnConfigsUpdate($id: String!, $subId: String, $value: JSON) {
    mnConfigsUpdate(_id: $id, subId: $subId, value: $value) {
      _id
      code
      subId
      value
    }
  }
`;

export const CREATE_ERKHET_SYNC_GENERAL_CONFIG = gql`
  mutation mnConfigsCreate($code: String!, $subId: String, $value: JSON) {
    mnConfigsCreate(code: $code, subId: $subId, value: $value) {
      _id
      code
      subId
      value
    }
  }
`;
