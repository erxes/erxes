import { gql } from '@apollo/client';

export const FIELD_GROUP_ADD = gql`
  mutation FieldGroupAdd(
    $name: String
    $code: String
    $description: String
    $contentType: String
    $logics: JSON
  ) {
    fieldGroupAdd(
      name: $name
      code: $code
      description: $description
      contentType: $contentType
      logics: $logics
    ) {
      _id
    }
  }
`;

export const FIELD_GROUP_EDIT = gql`
  mutation FieldGroupEdit($id: String!, $doc: FieldGroupInput!) {
    fieldGroupEdit(id: $id, doc: $doc) {
      _id
    }
  }
`;

export const FIELD_GROUP_REMOVE = gql`
  mutation FieldGroupRemove($id: String!) {
    fieldGroupRemove(id: $id) {
      _id
    }
  }
`;
