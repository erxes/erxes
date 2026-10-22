import { gql } from '@apollo/client';

const modelFields = gql`
  fragment dataModelsUiDefinition on DataModel {
    _id
    name
    labelSingular
    labelPlural
    description
    icon
    recordLabelField
    recordImageField
    source
    contentType
    version
    archivedAt
    recordFieldTypes
    systemFields {
      code
      name
      type
    }
  }
`;
export const DATA_MODEL_LIST = gql`
  ${modelFields}
  query dataModelsUiCatalog($archived: Boolean!, $limit: Int!, $offset: Int!) {
    dataModelList(archived: $archived, limit: $limit, offset: $offset) {
      list {
        ...dataModelsUiDefinition
      }
      totalCount
    }
  }
`;
export const DATA_MODEL_DETAIL = gql`
  ${modelFields}
  query dataModelsUiDetail($_id: String!) {
    dataModelDetail(_id: $_id) {
      ...dataModelsUiDefinition
    }
  }
`;
export const DATA_MODEL_CREATE = gql`
  ${modelFields}
  mutation dataModelsUiCreate($input: DataModelCreateInput!) {
    dataModelCreate(input: $input) {
      ...dataModelsUiDefinition
    }
  }
`;
export const DATA_MODEL_UPDATE = gql`
  ${modelFields}
  mutation dataModelsUiUpdate(
    $_id: String!
    $input: DataModelUpdateInput!
    $expectedVersion: Int!
  ) {
    dataModelUpdate(
      _id: $_id
      input: $input
      expectedVersion: $expectedVersion
    ) {
      ...dataModelsUiDefinition
    }
  }
`;
export const DATA_MODEL_ARCHIVE = gql`
  ${modelFields}
  mutation dataModelsUiArchive($_id: String!, $expectedVersion: Int!) {
    dataModelArchive(_id: $_id, expectedVersion: $expectedVersion) {
      ...dataModelsUiDefinition
    }
  }
`;
export const DATA_MODEL_RESTORE = gql`
  ${modelFields}
  mutation dataModelsUiRestore($_id: String!, $expectedVersion: Int!) {
    dataModelRestore(_id: $_id, expectedVersion: $expectedVersion) {
      ...dataModelsUiDefinition
    }
  }
`;
const fieldFields = gql`
  fragment dataModelsUiField on DataModelField {
    _id
    dataModelId
    name
    label
    description
    type
    required
    version
    archivedAt
    options {
      label
      value
    }
    relation {
      targetModelId
      multiple
      inverseFieldId
      isInverse
      morphId
      morphName
      morphSize
      targetModelName
      targetModelLabel
    }
  }
`;
export const DATA_MODEL_FIELDS = gql`
  ${fieldFields}
  query dataModelsUiFields($dataModelId: String!, $archived: Boolean) {
    dataModelFieldList(dataModelId: $dataModelId, archived: $archived) {
      ...dataModelsUiField
    }
  }
`;
export const DATA_MODEL_FIELD_CREATE = gql`
  ${fieldFields}
  mutation dataModelsUiFieldCreate(
    $dataModelId: String!
    $input: DataModelFieldCreateInput!
  ) {
    dataModelFieldCreate(dataModelId: $dataModelId, input: $input) {
      ...dataModelsUiField
    }
  }
`;
export const DATA_MODEL_FIELD_UPDATE = gql`
  ${fieldFields}
  mutation dataModelsUiFieldUpdate(
    $dataModelId: String!
    $_id: String!
    $expectedVersion: Int!
    $input: DataModelFieldUpdateInput!
  ) {
    dataModelFieldUpdate(
      dataModelId: $dataModelId
      _id: $_id
      expectedVersion: $expectedVersion
      input: $input
    ) {
      ...dataModelsUiField
    }
  }
`;
export const DATA_MODEL_FIELD_ARCHIVE = gql`
  ${fieldFields}
  mutation dataModelsUiFieldArchive(
    $dataModelId: String!
    $_id: String!
    $expectedVersion: Int!
  ) {
    dataModelFieldArchive(
      dataModelId: $dataModelId
      _id: $_id
      expectedVersion: $expectedVersion
    ) {
      ...dataModelsUiField
    }
  }
`;
export const DATA_MODEL_FIELD_RESTORE = gql`
  ${fieldFields}
  mutation dataModelsUiFieldRestore(
    $dataModelId: String!
    $_id: String!
    $expectedVersion: Int!
  ) {
    dataModelFieldRestore(
      dataModelId: $dataModelId
      _id: $_id
      expectedVersion: $expectedVersion
    ) {
      ...dataModelsUiField
    }
  }
`;
export const DATA_MODEL_RELATION_OPTIONS = gql`
  query dataModelsUiRelationOptions(
    $fieldId: String!
    $search: String!
    $limit: Int!
    $offset: Int!
  ) {
    dataModelRelationOptions(
      fieldId: $fieldId
      search: $search
      limit: $limit
      offset: $offset
    ) {
      list {
        _id
        label
        imageUrl
      }
      totalCount
    }
  }
`;

export const DATA_MODEL_RELATION_REFERENCES = gql`
  query dataModelsUiRelationReferences(
    $fieldId: String!
    $recordIds: [String!]!
  ) {
    dataModelRelationOptions(
      fieldId: $fieldId
      recordIds: $recordIds
      limit: 100
    ) {
      list {
        _id
        label
        imageUrl
      }
      totalCount
    }
  }
`;
