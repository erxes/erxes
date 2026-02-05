import { gql } from '@apollo/client';

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
