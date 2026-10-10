import {
  GQL_CURSOR_PARAM_DEFS,
  GQL_CURSOR_PARAMS,
  GQL_PAGE_INFO,
} from 'erxes-ui';
import gql from 'graphql-tag';

export const GET_DOCUMENT_PRINT_SALES_DEALS = gql(`
  query documentsPrintSalesDeals(
    $pipelineId: String!
    $stageId: String!
    $search: String
    ${GQL_CURSOR_PARAM_DEFS}
  ) {
    deals(
      pipelineId: $pipelineId
      stageId: $stageId
      search: $search
      ${GQL_CURSOR_PARAMS}
    ) {
      list {
        _id
        name
        number
      }
      ${GQL_PAGE_INFO}
    }
  }
`);

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
      totalCount
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
      commentData
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
