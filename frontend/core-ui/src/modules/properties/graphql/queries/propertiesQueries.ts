import { gql } from '@apollo/client';
import { GQL_PAGE_INFO } from 'erxes-ui';

export const FIELD_GROUPS_QUERY = gql`
  query FieldGroups($params: FieldGroupParams) {
    fieldGroups(params: $params) {
      list {
        _id
        contentType
        code
        createdAt
        description
        name
        order
        updatedAt
      }
      ${GQL_PAGE_INFO}
    }
  }
`;
