import { gql } from '@apollo/client';

export const PROPERTY_SYSTEM_FIELD_RULES_QUERY = gql`
  query PropertiesSystemFieldRules($contentType: String!) {
    propertySystemFields(contentType: $contentType) {
      code
      isVisible
      isVisibleToCreate
      isRequired
      requiredGroup
    }
  }
`;
