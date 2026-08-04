import { gql } from '@apollo/client';
import {
  GQL_CURSOR_PARAM_DEFS,
  GQL_CURSOR_PARAMS,
  GQL_PAGE_INFO,
} from 'erxes-ui';

export const QUERY_TEMPLATE_CATEGORIES = gql`
  query TemplateCategories(
    $searchValue: String
    $types: [String]
    $parentIds: [String]
    $createdBy: String
    $updatedBy: String
    $dateFilters: String

    ${GQL_CURSOR_PARAM_DEFS}
  ) {
    templateCategories(
      searchValue: $searchValue
      types: $types
      parentIds: $parentIds
      createdBy: $createdBy
      updatedBy: $updatedBy
      dateFilters: $dateFilters

      ${GQL_CURSOR_PARAMS}
    ) {
      list {
        _id
        name
        parentId
        parent {
          _id
          name
        }
        code
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
      parent {
        _id
        name
      }
      code
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
