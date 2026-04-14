import { gql } from '@apollo/client';

export const GET_SALES_BOARDS = gql`
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

export const GET_SALES_PIPELINES = gql`
  query SalesPipelines($boardId: String) {
    salesPipelines(boardId: $boardId) {
      list {
        _id
        name
        boardId
      }
    }
  }
`;

export const GET_SALES_DEALS = gql`
  query SalesDeals(
    $searchValue: String
    $pipelineId: String
    $stageId: String
  ) {
    salesDeals(
      searchValue: $searchValue
      pipelineId: $pipelineId
      stageId: $stageId
    ) {
      _id
      name
      number
      stageId
    }
  }
`;

export const GET_SALES_STAGES = gql`
  query SalesStages($pipelineId: String) {
    salesStages(pipelineId: $pipelineId) {
      _id
      name
      order
      pipelineId
    }
  }
`;
