import { gql } from '@apollo/client';

export const CHANGEME_CHANGEMODULE_ITEM_ADD = gql`
  mutation changemecChangemoduleItemAdd(
    $name: String!
    $code: String!
    $status: String
  ) {
    changemecChangemoduleItemAdd(name: $name, code: $code, status: $status) {
      _id
      name
      code
      status
    }
  }
`;
