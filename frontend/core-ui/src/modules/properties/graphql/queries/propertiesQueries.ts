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
