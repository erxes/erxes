import { gql } from '@apollo/client';
import { GQL_PAGE_INFO } from 'erxes-ui';

export const FIELDS_QUERY = gql`
  query Fields($params: FieldsParams) {
    fields(params: $params) {
      list {
        _id
        name
        icon
        code
        type
        order
        validations
        logics
        createdAt
        updatedAt
      }
      ${GQL_PAGE_INFO}
    }
  }
`;
