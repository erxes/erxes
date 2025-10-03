import {
  GQL_CURSOR_PARAM_DEFS,
  GQL_CURSOR_PARAMS,
  GQL_PAGE_INFO,
} from 'erxes-ui';
import gql from 'graphql-tag';

export const GET_DOCUMENTS_TYPES = gql(`
  query DocumentsTypes {
    documentsTypes {
      label
      contentType
      subTypes
    }
  }
`);

export const GET_DOCUMENTS = gql(`
  query Documents(
    $searchValue: String
    $contentType: String
    $subType: String
    $userIds: [String]
    $dateFilters: String
    $orderBy: JSON
    ${GQL_CURSOR_PARAM_DEFS}
  ) {
    documents(
      searchValue: $searchValue
      contentType: $contentType
      subType: $subType
      userIds: $userIds
      dateFilters: $dateFilters
      orderBy: $orderBy
      ${GQL_CURSOR_PARAMS}
    ) {
      list {
        _id
        code
        createdAt
        createdUser {
          _id
          details {
            avatar
            lastName
            fullName
          }
        }
        contentType
        subType
        name
        content
        replacer
      }
      ${GQL_PAGE_INFO}
    }
  }
`);

export const GET_DOCUMENT_DETAIL = gql(`
  query Document(
    $_id: String!
  ) {
    documentsDetail(
      _id: $_id
    ) {
      _id
      code
      createdAt
      createdUser {
        details {
          avatar
          lastName
          fullName
        }
      }
      contentType
      subType
      name
      content
      replacer
    }
  }
`);

export const GET_DOCUMENT_EDITOR_ATTRIBUTES = gql(`
  query DocumentEditorAttributes(
    $contentType: String!
  ) {
    documentsGetEditorAttributes(
      contentType: $contentType
    ) {
      value
      name
      groupDetail
    }
  }
`);
