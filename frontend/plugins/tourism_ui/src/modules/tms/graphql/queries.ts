import { gql } from '@apollo/client';

export const GET_BRANCH_LIST = gql`
  query BmsBranchList(
    $limit: Int
    $cursor: String
    $cursorMode: CURSOR_MODE
    $direction: CURSOR_DIRECTION
    $orderBy: JSON
    $sortMode: String
    $aggregationPipeline: [JSON]
  ) {
    bmsBranchList(
      limit: $limit
      cursor: $cursor
      cursorMode: $cursorMode
      direction: $direction
      orderBy: $orderBy
      sortMode: $sortMode
      aggregationPipeline: $aggregationPipeline
    ) {
      list {
        _id
        createdAt
        userId
        user {
          _id
          username
          email
          details {
            avatar
            fullName
            shortName
          }
        }
        name
        description
        generalManagerIds
        managerIds
        paymentIds
        paymentTypes
        departmentId
        token
        erxesAppToken
        permissionConfig
        uiOptions
        managers {
          _id
          email
          username
          details {
            avatar
            fullName
            shortName
          }
        }
        generalManagers {
          _id
          email
          username
          details {
            avatar
            fullName
            shortName
          }
        }
        __typename
      }
      totalCount
      pageInfo {
        hasNextPage
        hasPreviousPage
        startCursor
        endCursor
      }
    }
  }
`;

export const BRANCH_LIST_DETAIL = gql`
  query BmsBranchDetail($id: String!) {
    bmsBranchDetail(_id: $id) {
      _id
      createdAt
      userId
      user {
        _id
        username
        email
        details {
          avatar
          fullName
          shortName
        }
      }
      name
      description
      generalManagerIds
      managerIds
      paymentIds
      paymentTypes
      departmentId
      token
      erxesAppToken
      permissionConfig
      uiOptions
    }
  }
`;

export const PAYMENT_LIST = gql`
  query Payments($status: String, $kind: String) {
    payments(status: $status, kind: $kind) {
      _id
      name
      kind
      status
      config
      createdAt
    }
  }
`;
