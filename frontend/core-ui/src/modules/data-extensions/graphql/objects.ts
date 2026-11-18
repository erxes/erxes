import { gql } from '@apollo/client';

const OBJECT_FIELDS = gql`
  fragment DataExtensionObjectFields on DataExtensionObject {
    _id
    key
    recordType
    singularLabel
    pluralLabel
    description
    icon
    status
    createdAt
    updatedAt
  }
`;

export const DATA_EXTENSION_OBJECTS = gql`
  query DataExtensionObjects($includeArchived: Boolean) {
    dataExtensionObjects(includeArchived: $includeArchived) {
      ...DataExtensionObjectFields
    }
  }
  ${OBJECT_FIELDS}
`;

export const DATA_EXTENSION_OBJECT_ADD = gql`
  mutation DataExtensionObjectAdd($input: DataExtensionObjectAddInput!) {
    dataExtensionObjectAdd(input: $input) {
      ...DataExtensionObjectFields
    }
  }
  ${OBJECT_FIELDS}
`;

export const DATA_EXTENSION_OBJECT_EDIT = gql`
  mutation DataExtensionObjectEdit(
    $_id: String!
    $input: DataExtensionObjectEditInput!
  ) {
    dataExtensionObjectEdit(_id: $_id, input: $input) {
      ...DataExtensionObjectFields
    }
  }
  ${OBJECT_FIELDS}
`;

export const DATA_EXTENSION_OBJECT_ARCHIVE = gql`
  mutation DataExtensionObjectArchive($_id: String!) {
    dataExtensionObjectArchive(_id: $_id) {
      ...DataExtensionObjectFields
    }
  }
  ${OBJECT_FIELDS}
`;

export const DATA_EXTENSION_OBJECT_RESTORE = gql`
  mutation DataExtensionObjectRestore($_id: String!) {
    dataExtensionObjectRestore(_id: $_id) {
      ...DataExtensionObjectFields
    }
  }
  ${OBJECT_FIELDS}
`;

export const DATA_EXTENSION_OBJECT_DELETE = gql`
  mutation DataExtensionObjectDelete($_id: String!) {
    dataExtensionObjectDelete(_id: $_id)
  }
`;
