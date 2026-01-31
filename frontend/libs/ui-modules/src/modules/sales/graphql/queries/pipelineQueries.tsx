import { gql } from '@apollo/client';

export const pipelineLabelFields = `
  _id
  name
  colorCode
  pipelineId
  createdBy
  createdAt
`;

export const GET_PIPELINE_DETAIL = gql`
  query SalesPipelineDetail($_id: String!) {
    salesPipelineDetail(_id: $_id) {
      _id
      name
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

export const GET_PIPELINES = gql`
  query SalesPipelines(${commonParams}) {
    salesPipelines(${commonParamDefs}) {
      list {
        _id
        name
        boardId
      }
      totalCount
    }
  }
`;
