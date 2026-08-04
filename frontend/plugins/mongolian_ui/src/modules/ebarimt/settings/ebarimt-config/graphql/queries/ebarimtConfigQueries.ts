import { gql } from '@apollo/client';
export const GET_FIELDS_GROUPS = gql`
  query fieldsGroups($contentType: String!) {
    fieldsGroups(contentType: $contentType) {
      _id
      name
      description
      code
      contentType
      fields {
        name
        _id
        text
        type
        code
        description
        isRequired
        options
        isVisible
      }
    }
  }
`;
