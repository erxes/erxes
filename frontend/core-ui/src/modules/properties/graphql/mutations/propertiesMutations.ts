import { gql } from '@apollo/client';

export const FIELD_GROUP_ADD = gql`
  mutation FieldGroupAdd($doc: FieldGroupInput!) {
    fieldGroupAdd(doc: $doc) {
      _id
      code
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
