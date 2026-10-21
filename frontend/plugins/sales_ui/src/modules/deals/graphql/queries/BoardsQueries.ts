import { gql } from '~/gql';

export const GET_BOARDS = gql(`
  query SalesBoards {
    salesBoards {
      _id
      name

      pipelines {
        _id
        name
        status
      }
    }
  }
`);

export const GET_BOARD_GET_LAST = gql(`
  query SalesBoardGetLast {
    salesBoardGetLast {
      _id
      name
      createdAt
      pipelines {
        _id
        name
        status
      }
    }
  }
`);

export const GET_BOARD_DETAIL = gql(`
  query salesDealBoardDetail($_id: String!) {
    salesBoardDetail(_id: $_id) {
      _id
      name
      pipelines {
        _id
        name
        status
        visibility
        memberIds
        isWatched
        startDate
        endDate
        state
        itemsTotalCount
        members {
          _id
          email
          username
          details {
            avatar
            fullName
          }
        }
      }
    }
  }
`);

export const GET_BOARD_COUNTS = gql(`
  query SalesBoardCounts {
    salesBoardCounts {
      _id
      name
      count
    }
  }
`);

export const GET_BOARD_CONTENT_TYPE_DETAIL = gql(`
  query SalesBoardContentTypeDetail($contentType: String, $contentId: String){
    salesBoardContentTypeDetail(contentType: $contentType, contentId: $contentId)
  }
`);

export const GET_BOARD_LOGS = gql(`
  query SalesBoardLogs($action: String, $content: JSON, $contentId: String){
    salesBoardLogs(action: $action, content: $content, contentId: $contentId)
  }
`);
