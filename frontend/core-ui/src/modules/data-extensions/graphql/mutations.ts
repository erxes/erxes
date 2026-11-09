import { gql } from '@apollo/client';
import { DATA_EXTENSION_FIELD_FIELDS } from 'ui-modules';

export const DATA_EXTENSION_FIELD_ADD = gql`
  mutation DataExtensionFieldAdd($input: DataExtensionFieldAddInput!) {
    dataExtensionFieldAdd(input: $input) {
      ...DataExtensionFieldFields
    }
  }
  ${DATA_EXTENSION_FIELD_FIELDS}
`;

export const DATA_EXTENSION_RELATION_ADD = gql`
  mutation DataExtensionRelationAdd($input: DataExtensionRelationAddInput!) {
    dataExtensionRelationAdd(input: $input) {
      ...DataExtensionFieldFields
    }
  }
  ${DATA_EXTENSION_FIELD_FIELDS}
`;

export const DATA_EXTENSION_FIELD_EDIT = gql`
  mutation DataExtensionFieldEdit(
    $_id: String!
    $input: DataExtensionFieldEditInput!
  ) {
    dataExtensionFieldEdit(_id: $_id, input: $input) {
      ...DataExtensionFieldFields
    }
  }
  ${DATA_EXTENSION_FIELD_FIELDS}
`;

export const DATA_EXTENSION_FIELD_ARCHIVE = gql`
  mutation DataExtensionFieldArchive($_id: String!) {
    dataExtensionFieldArchive(_id: $_id) {
      ...DataExtensionFieldFields
    }
  }
  ${DATA_EXTENSION_FIELD_FIELDS}
`;

export const DATA_EXTENSION_FIELD_RESTORE = gql`
  mutation DataExtensionFieldRestore($_id: String!) {
    dataExtensionFieldRestore(_id: $_id) {
      ...DataExtensionFieldFields
    }
  }
  ${DATA_EXTENSION_FIELD_FIELDS}
`;

export const DATA_EXTENSION_FIELD_DELETE = gql`
  mutation DataExtensionFieldDelete($_id: String!) {
    dataExtensionFieldDelete(_id: $_id)
  }
`;
