import { gql } from '@apollo/client';

export const SAVE_DOCUMENT = gql`
  mutation documentsSave(
    $_id: String
    $contentType: String
    $subType: String
    $name: String!
    $content: String
    $replacer: String
    $code: String
  ) {
    documentsSave(
      _id: $_id
      contentType: $contentType
      subType: $subType
      name: $name
      content: $content
      replacer: $replacer
      code: $code
    ) {
      _id
      code
      contentType
      subType
      name
      content
      replacer
    }
  }
`;

export const REMOVE_DOCUMENT = gql`
  mutation DocumentsRemove($id: String!) {
    documentsRemove(_id: $id)
  }
`;
