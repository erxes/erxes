import { gql } from '@apollo/client';

export const PROPERTY_SYSTEM_FIELDS_LAYOUT_QUERY = gql`
  query PropertiesSystemFieldsLayout($contentType: String!) {
    propertySystemFieldsLayout(contentType: $contentType)
  }
`;
