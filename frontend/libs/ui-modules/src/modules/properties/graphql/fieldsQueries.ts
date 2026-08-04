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
        groupId
        validations
        logics
        createdAt
        updatedAt
        isVisible
        isVisibleToCreate
        isRequired
        isVisibleInCard
        options {
          label
          value
        }
      }
      totalCount
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
      groupId
      type
      order
      options {
        label
        value
      }
      validations
      logics
      icon
      isVisible
      isVisibleToCreate
      isRequired
      isVisibleInCard
      createdAt
      updatedAt
    }
  }
`;
