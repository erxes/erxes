import { gql } from "@apollo/client";

const GET_PIPELINE_DETAIL = gql`
  query SalesPipelineDetail($_id: String!) {
    salesPipelineDetail(_id: $_id) {
      _id
      name
      bgColor
      isWatched
      hackScoringType
      tagId
      initialCategoryIds
      excludeCategoryIds
      excludeProductIds
      paymentIds
      paymentTypes
      erxesAppToken
      visibility
      memberIds
      departmentIds
      branchIds
      boardId
    }
  }
`;

const commonParams = `
  $boardId: String, 
  $isAll: Boolean, 
  $limit: Int, 
  $cursor: String, 
  $cursorMode: CURSOR_MODE, 
  $direction: CURSOR_DIRECTION, 
  $orderBy: JSON
`;

const commonParamDefs = `
  boardId: $boardId,
  isAll: $isAll,
  limit: $limit,
  cursor: $cursor,
  cursorMode: $cursorMode,
  direction: $direction,
  orderBy: $orderBy
`;

const GET_PIPELINES = gql`
  query SalesPipelines(${commonParams}) {
    salesPipelines(${commonParamDefs}) {
      list {
        _id
        name
        boardId
        state
        startDate
        endDate
        status
        createdAt
        createdUser {
          details {
            fullName
          }
        }
        itemsTotalCount
      }
      pageInfo {
        endCursor
        startCursor
        hasNextPage
        hasPreviousPage
      }
      totalCount
    }
  }
`;

export {
  GET_PIPELINE_DETAIL,
  GET_PIPELINES,
}
    
