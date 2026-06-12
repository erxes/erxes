import { gql } from '@apollo/client';

export const FIELDS_COMBINED_BY_CONTENT_TYPE = gql`
  query FieldsCombinedByContentType($contentType: String!) {
    fieldsCombinedByContentType(contentType: $contentType)
  }
`;
