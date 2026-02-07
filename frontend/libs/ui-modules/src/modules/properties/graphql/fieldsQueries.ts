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
        configs
      }
      ${GQL_PAGE_INFO}
    }
  }
`;

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
        options {
          label
          value
        }
      }
      ${GQL_PAGE_INFO}
    }
  }
`;

export const FIELD_DETAILS_QUERY = gql`
  query FieldDetail($id: String!) {
    fieldDetail(_id: $id) {
      _id
      name
      code
      type
      order
      options {
        label
        value
      }
      validations
      logics
      icon
      createdAt
      updatedAt
    }
  }
`;
