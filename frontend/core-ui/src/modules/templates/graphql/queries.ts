import { gql } from '@apollo/client';
import {
  GQL_CURSOR_PARAM_DEFS,
  GQL_CURSOR_PARAMS,
  GQL_PAGE_INFO,
} from 'erxes-ui';

export const QUERY_TEMPLATES = gql`
  query TemplateList(
    $searchValue: String
    $contentType: String
    $categoryIds: [String]

    ${GQL_CURSOR_PARAM_DEFS}
    ) {
    templateList(
      searchValue: $searchValue
      contentType: $contentType
      categoryIds: $categoryIds

      ${GQL_CURSOR_PARAMS}
    ) {
      list {
        _id
        name
        description
        contentType
        content
        categoryIds
        categories {
          _id
          name
        }
        createdAt
        createdBy {
          _id
          email
          details {
            avatar
            firstName
            fullName
            lastName
          }
        }
        updatedAt
        updatedBy {
          _id
          email
          details {
            avatar
            firstName
            fullName
            lastName
          }
        }
      }
      ${GQL_PAGE_INFO}
    }
  }
`;

export const QUERY_TEMPLATE_TYPES = gql`
  query templatesGetTypes {
    templatesGetTypes
  }
`;

export const QUERY_TEMPLATE_CATEGORIES = gql`
  query TemplateCategories($type: String, ${GQL_CURSOR_PARAM_DEFS}) {
    templateCategories(type: $type, ${GQL_CURSOR_PARAMS}) {
      list {
        _id
        name
        parentId
        order
        code
        contentType
        templateCount
        isRoot
        createdAt
        createdBy {
          _id
          email
          details {
            avatar
            firstName
            fullName
            lastName
          }
        }
        updatedAt
        updatedBy {
          _id
          email
          details {
            avatar
            firstName
            fullName
            lastName
          }
        }
      }
      ${GQL_PAGE_INFO}
    }
}
`;

export const QUERY_TEMPLATE_CATEGORY = gql`
  query TemplateCategory($_id: String) {
    templateCategory(_id: $_id) {
      _id
      name
      parentId
      order
      code
      contentType
      templateCount
      isRoot
      createdAt
      createdBy {
        _id
        email
        details {
          avatar
          firstName
          fullName
          lastName
        }
      }
      updatedAt
      updatedBy {
        _id
        email
        details {
          avatar
          firstName
          fullName
          lastName
        }
      }
    }
  }
`;
