import gql from 'graphql-tag';

/**
 * The form-field catalog automations builds its attribute list from. Segments
 * moved to their own declaration, so this query lives with the feature that
 * still uses it.
 */
export const FIELDS_COMBINED_BY_CONTENT_TYPE = gql`
  query Fields($contentType: String!) {
    fieldsCombinedByContentType(contentType: $contentType)
  }
`;
