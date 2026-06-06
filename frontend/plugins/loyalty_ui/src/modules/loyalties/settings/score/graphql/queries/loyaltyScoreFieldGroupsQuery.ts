import { gql } from '@apollo/client';

export const LOYALTY_SCORE_FIELD_GROUPS_QUERY = gql`
  query fieldGroups($params: FieldGroupParams) {
    fieldGroups(params: $params) {
      list {
        _id
        name
        code
        description
        contentType
        order
      }
    }
  }
`;
