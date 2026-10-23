import { gql } from '@apollo/client';

export const DATA_EXTENSION_FIELD_FIELDS = gql`
  fragment DataExtensionFieldFields on DataExtensionField {
    _id
    recordType
    key
    label
    description
    type
    options {
      value
      label
    }
    relation {
      targetRecordType
      kind
      side
      inverseFieldId
    }
    order
    status
    createdAt
    updatedAt
  }
`;

export const DATA_EXTENSION_RECORD_TYPES = gql`
  query DataExtensionRecordTypes {
    dataExtensionRecordTypes {
      recordType
      label
      typeName
      owner
      fieldCount
    }
  }
`;

export const DATA_EXTENSION_FIELDS = gql`
  query DataExtensionFields($recordType: String, $includeArchived: Boolean) {
    dataExtensionFields(
      recordType: $recordType
      includeArchived: $includeArchived
    ) {
      ...DataExtensionFieldFields
    }
  }
  ${DATA_EXTENSION_FIELD_FIELDS}
`;
