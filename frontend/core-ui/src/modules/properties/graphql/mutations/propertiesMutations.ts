import { gql } from '@apollo/client';

export const FIELD_GROUP_ADD = gql`
  mutation FieldGroupAdd(
    $name: String
    $code: String
    $icon: String
    $description: String
    $contentType: String
    $logics: JSON
  ) {
    fieldGroupAdd(
      name: $name
      code: $code
      icon: $icon
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

export const FIELD_ADD = gql`
  mutation FieldAdd(
    $name: String
    $code: String
    $groupId: String
    $contentType: String
    $type: String
    $options: [FieldOptionInput]
    $validations: JSON
    $logics: JSON
    $icon: String
  ) {
    fieldAdd(
      name: $name
      code: $code
      groupId: $groupId
      contentType: $contentType
      type: $type
      options: $options
      validations: $validations
      logics: $logics
      icon: $icon
    ) {
      _id
    }
  }
`;

export const FIELD_EDIT = gql`
  mutation FieldEdit(
    $id: String!
    $order: Float
    $code: String
    $name: String
    $groupId: String
    $contentType: String
    $type: String
    $options: [FieldOptionInput]
    $validations: JSON
    $logics: JSON
    $icon: String
  ) {
    fieldEdit(
      _id: $id
      order: $order
      code: $code
      name: $name
      groupId: $groupId
      contentType: $contentType
      type: $type
      options: $options
      validations: $validations
      logics: $logics
      icon: $icon
    ) {
      _id
    }
  }
`;
