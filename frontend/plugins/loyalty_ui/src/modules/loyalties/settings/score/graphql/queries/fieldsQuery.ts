import { gql } from '@apollo/client';

export const FIELDS_QUERY = gql`
  query Fields($params: FieldsParams) {
    fields(params: $params) {
      list {
        _id
        name
        code
        type
        order
        groupId
        options {
          label
          value
          coordinates
        }
        validations
        logics
        configs
        icon
        createdAt
        updatedAt
      }
      pageInfo {
        hasNextPage
        hasPreviousPage
        startCursor
        endCursor
      }
      totalCount
    }
  }
`;
