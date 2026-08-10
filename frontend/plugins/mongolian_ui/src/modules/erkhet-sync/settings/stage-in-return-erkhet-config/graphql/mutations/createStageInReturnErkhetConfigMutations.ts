import { gql } from '@apollo/client';

export const CREATE_STAGE_IN_RETURN_ERKHET_CONFIG = gql`
  mutation mnConfigsCreate($code: String!, $subId: String, $value: JSON) {
    mnConfigsCreate(code: $code, subId: $subId, value: $value) {
      _id
      code
      subId
      value
    }
  }
`;

export const UPDATE_STAGE_IN_RETURN_ERKHET_CONFIG = gql`
  mutation mnConfigsUpdate($id: String!, $subId: String, $value: JSON) {
    mnConfigsUpdate(_id: $id, subId: $subId, value: $value) {
      _id
      code
      subId
      value
    }
  }
`;

export const REMOVE_STAGE_IN_RETURN_ERKHET_CONFIG = gql`
  mutation mnConfigsRemove($id: String!) {
    mnConfigsRemove(_id: $id)
  }
`;
