import { gql } from '@apollo/client';

export const TEMPLATE_LIST = gql`
  query templateList(
    $page: Int
    $perPage: Int
    $limit: Int
    $cursor: String
    $searchValue: String
    $status: String
    $categoryIds: [String]
  ) {
    templateList(
      page: $page
      perPage: $perPage
      limit: $limit
      cursor: $cursor
      searchValue: $searchValue
      status: $status
      categoryIds: $categoryIds
    ) {
      list {
        _id
        name
        content
        contentType
        description
        pluginType
        categoryIds
        status
        createdBy
        createdAt
        updatedAt
        cursor
      }
      pageInfo {
        hasNextPage
        endCursor
      }
      totalCount
    }
  }
`;

export const TEMPLATE_DETAIL = gql`
  query templateDetail($_id: String!) {
    templateDetail(_id: $_id) {
      _id
      name
      content
      contentType
      description
      pluginType
      categoryIds
      status
      createdBy
      createdAt
      updatedAt
    }
  }
`;

export const CATEGORY_LIST = gql`
  query categoryList($type: String) {
    categoryList(type: $type) {
      list {
        _id
        name
        parentId
        order
        code
        contentType
        templateCount
        isRoot
      }
      totalCount
    }
  }
`;

export default {
  TEMPLATE_LIST,
  TEMPLATE_DETAIL,
  CATEGORY_LIST,
};
