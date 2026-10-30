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
    $commentState: String
  ) {
    documentsSave(
      _id: $_id
      contentType: $contentType
      subType: $subType
      name: $name
      content: $content
      replacer: $replacer
      code: $code
      commentState: $commentState
    ) {
      _id
      code
      contentType
      subType
      name
      content
      replacer
      commentState
    }
  }
`;

export const DUPLICATE_DOCUMENT = gql`
  mutation documentsDuplicate($_id: String!, $contentType: String!) {
    documentsDuplicate(_id: $_id, contentType: $contentType) {
      _id
      name
      contentType
    }
  }
`;

export const REMOVE_DOCUMENT = gql`
  mutation documentsRemove($id: String!) {
    documentsRemove(_id: $id)
  }
`;
