import { gql } from '@apollo/client';

export const PROPERTY_CREATE_FIELD_RULES_QUERY = gql`
  query PropertiesCreateFieldRules($contentType: String!) {
    propertySystemFields(contentType: $contentType) {
      code
      isVisibleToCreate
      isRequired
      requiredGroup
    }
  }
`;
