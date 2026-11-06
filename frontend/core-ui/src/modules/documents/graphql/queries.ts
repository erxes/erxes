import {
  GQL_CURSOR_PARAM_DEFS,
  GQL_CURSOR_PARAMS,
  GQL_PAGE_INFO,
} from 'erxes-ui';
import gql from 'graphql-tag';

export const GET_DOCUMENTS_TYPES = gql(`
  query documentsTypesList {
    documentsTypes {
      label
      contentType
      subTypes
    }
  }
`);

export const GET_DOCUMENTS = gql(`
  query documentsList(
    $searchValue: String
    $contentType: String
    $subType: String
    $tagIds: [String]
    $userIds: [String]
    $dateFilters: String
    $orderBy: JSON
    ${GQL_CURSOR_PARAM_DEFS}
  ) {
    documents(
      searchValue: $searchValue
      contentType: $contentType
      subType: $subType
      tagIds: $tagIds
      userIds: $userIds
      dateFilters: $dateFilters
      orderBy: $orderBy
      ${GQL_CURSOR_PARAMS}
    ) {
      list {
        _id
        tagIds
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
        approvalLockState {
          contentType
          contentId
          locked
          hasAccess
        }
      }
      ${GQL_PAGE_INFO}
    }
  }
`);

export const GET_DOCUMENT_DETAIL = gql(`
  query documentsDetailQuery(
    $_id: String!
  ) {
    documentsDetail(
      _id: $_id
    ) {
      _id
      tagIds
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
      commentState
    }
  }
`);

export const GET_DOCUMENT_EDITOR_ATTRIBUTES = gql(`
  query documentsEditorAttributesQuery(
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

export const COMMENT_AUTHORS = gql(`
  query documentsCommentAuthors($ids: [String], $limit: Int) {
    users(ids: $ids, limit: $limit) {
      list {
        _id
        email
        details {
          fullName
          avatar
        }
      }
    }
  }
`);
