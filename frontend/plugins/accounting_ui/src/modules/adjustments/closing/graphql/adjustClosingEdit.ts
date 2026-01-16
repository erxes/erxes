import { gql } from '@apollo/client';

export const ADJUST_CLOSING_ENTRIES_EDIT = gql`
  mutation AdjustClosingEntriesEdit(
    $_id: String!
    $code: String
    $name: String
    $description: String
  ) {
    adjustClosingEntriesEdit(
      _id: $_id
      code: $code
      name: $name
      description: $description
    ) {
      _id
      code
      name
      description
      createdAt
      updatedAt
    }
  }
`;
