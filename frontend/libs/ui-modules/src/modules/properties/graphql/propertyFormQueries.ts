import { gql } from '@apollo/client';

export const FIELD_OPTION_DEPENDENTS_QUERY = gql`
  query PropertiesFieldOptionDependents($_id: String!, $value: String!) {
    fieldOptionDependents(_id: $_id, value: $value) {
      logics
      segments
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
