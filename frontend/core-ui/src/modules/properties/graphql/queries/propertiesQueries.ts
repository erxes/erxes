import { gql } from '@apollo/client';

export const PROPERTY_TYPES_QUERY = gql`
  query PropertyTypes {
    propertyTypes
  }
`;

export const PROPERTY_SYSTEM_FIELD_SELECTION = `
  code
  name
  type
  isVisible
  isVisibleToCreate
  isRequired
  logics
  requiredGroup
  alwaysFilled
  notOnCreate
  outsideLayout
`;

export const PROPERTY_SYSTEM_FIELDS_QUERY = gql`
  query PropertySystemFields($contentType: String!) {
    propertySystemFields(contentType: $contentType) {
      ${PROPERTY_SYSTEM_FIELD_SELECTION}
    }
  }
`;

export const FIELD_USAGE_QUERY = gql`
  query FieldUsage(
    $fieldIds: [String!]
    $groupId: String
    $contentType: String!
  ) {
    fieldUsage(
      fieldIds: $fieldIds
      groupId: $groupId
      contentType: $contentType
    ) {
      dependents
      hasValues
      removable
    }
  }
`;

export const ARCHIVED_FIELD_GROUPS_QUERY = gql`
  query ArchivedFieldGroups($contentType: String!) {
    fieldGroups(params: { contentType: $contentType, archived: true }) {
      list {
        _id
        name
        archivedAt
      }
    }
  }
`;

export const ARCHIVED_FIELDS_QUERY = gql`
  query ArchivedFields($contentType: String!) {
    fields(params: { contentType: $contentType, archived: true, limit: 100 }) {
      list {
        _id
        name
        groupId
        archivedAt
      }
    }
  }
`;

export const FIELD_VALUE_USAGE_QUERY = gql`
  query PropertiesFieldValueUsage($_id: String!, $value: String) {
    fieldValueUsage(_id: $_id, value: $value) {
      known
      samples {
        _id
        label
      }
      dependents
    }
  }
`;

export const FIELD_VALUE_COUNTS_QUERY = gql`
  query PropertiesFieldValueCounts($_id: String!, $value: String) {
    fieldValueCounts(_id: $_id, value: $value) {
      known
      count
      capped
      byOption {
        value
        count
      }
    }
  }
`;

export const FIELD_OPTION_DEPENDENTS_QUERY = gql`
  query PropertiesFieldOptionDependents($_id: String!, $value: String!) {
    fieldOptionDependents(_id: $_id, value: $value) {
      logics
      segments
    }
  }
`;
