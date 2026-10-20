import { gql } from '~/gql';

export const GET_SALES_BOARDS = gql(`
  query mongolianSalesBoards {
    salesBoards {
      _id
      name
      order
      createdAt
      type
      pipelines {
        _id
        name
        type
      }
    }
  }
`);

export const GET_SALES_PIPELINES = gql(`
  query mongolianSalesPipelines($boardId: String) {
    salesPipelines(boardId: $boardId) {
      pageInfo {
        hasNextPage
        hasPreviousPage
        startCursor
        endCursor
      }
      list {
        _id
        name
        boardId
        startDate
        endDate
        itemsTotalCount
        state
        type
      }
      totalCount
    }
  }
`);

export const GET_SALES_STAGES = gql(`
  query mongolianSalesStages($pipelineId: String!) {
    salesStages(pipelineId: $pipelineId) {
      _id
      name
      order
      unUsedAmount
      amount
      itemsTotalCount
      pipelineId
      code
      age
      defaultTick
      probability
      type
    }
  }
`);
