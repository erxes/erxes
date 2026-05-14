import { gql } from "@apollo/client";

const GET_BOARDS = gql`
  query SalesBoards {
    salesBoards {
      _id
      name

      pipelines {
        _id
        name
      }
    }
  }
`;

const GET_BOARD_DETAIL = gql`
  query SalesBoardDetail($_id: String!) {
    salesBoardDetail(_id: $_id) {
      _id
      name
      pipelines {
        _id
        name
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
`;

export {
  GET_BOARDS,
  GET_BOARD_DETAIL,
}
