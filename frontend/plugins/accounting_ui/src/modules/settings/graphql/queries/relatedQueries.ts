import { gql } from '@apollo/client';

export const POS_LIST = gql`
  query posList(
    $page: Int
    $perPage: Int
    $sortField: String
    $sortDirection: Int
  ) {
    posList(
      page: $page
      perPage: $perPage
      sortField: $sortField
      sortDirection: $sortDirection
    ) {
      _id
      name
    }
  }
`;

export const POS_DETAIL = gql`
  query posDetail($_id: String!) {
    posDetail(_id: $_id) {
      _id
      name
      description
      token
      paymentTypes
    }
  }
`;

export const PIPELINE_DETAIL = gql`
  query SalesPipelineDetail($_id: String!) {
    salesPipelineDetail(_id: $_id) {
      _id
      name
      paymentIds
      paymentTypes
    }
  }
`;

export const DEAL_FIELD_GROUPS_WITH_FIELDS = gql`
  query DealFieldGroupsWithFields($contentType: String!, $limit: Int) {
    fieldGroups(params: { contentType: $contentType, limit: $limit }) {
      list {
        _id
        name
      }
    }
    fields(params: { contentType: $contentType, limit: $limit }) {
      list {
        _id
        name
        code
        type
        groupId
      }
    }
  }
`;
