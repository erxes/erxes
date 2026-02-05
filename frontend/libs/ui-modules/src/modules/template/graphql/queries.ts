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
    $contentType: String
  ) {
    templateList(
      page: $page
      perPage: $perPage
      limit: $limit
      cursor: $cursor
      searchValue: $searchValue
      status: $status
      categoryIds: $categoryIds
      contentType: $contentType
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

export const TEMPLATES_GET_TYPES = gql`
  query templatesGetTypes {
    templatesGetTypes
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
  TEMPLATES_GET_TYPES,
  CATEGORY_LIST,
};
