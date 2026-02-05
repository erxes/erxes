import { gql } from '@apollo/client';

export const LOYALTY_SCORE_FIELD_GROUPS_QUERY = gql`
  query fieldsGroups($contentType: String!, $isDefinedByErxes: Boolean) {
    fieldsGroups(
      contentType: $contentType
      isDefinedByErxes: $isDefinedByErxes
    ) {
      _id
      name
      description
      code
      order
      contentType
      __typename
    }
  }
`;
