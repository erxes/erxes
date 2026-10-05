import { gql } from '@apollo/client';

export const CHANGEME_CHANGEMODULE_ITEMS = gql`
  query changemecChangemoduleItems($status: String) {
    changemecChangemoduleItems(status: $status) {
      _id
      name
      code
      status
    }
  }
`;
