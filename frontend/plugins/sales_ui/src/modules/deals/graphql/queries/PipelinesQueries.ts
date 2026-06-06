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
      numberConfig
      numberSize
      nameConfig
      isCheckDate
      isCheckUser
      isCheckDepartment
      excludeCheckUserIds
    }
  }
`;

export const GET_PIPELINE_LABELS = gql`
  query SalesPipelineLabels($pipelineId: String, $pipelineIds: [String]) {
    salesPipelineLabels(pipelineId: $pipelineId, pipelineIds: $pipelineIds) {
      ${pipelineLabelFields}
    }
  }
`;

export const GET_PIPELINE_ASSIGNED_USERS = gql`
  query SalesPipelineAssignedUsers($_id: String!) {
    salesPipelineAssignedUsers(_id: $_id) {
      _id
      details {
        avatar
        fullName
      }
    }
  }
`;

export const GET_PIPELINE_LABEL_DETAIL = gql`
  query SalesPipelineLabelDetail($_id: String!) {
    salesPipelineLabelDetail(_id: $_id) {
      ${pipelineLabelFields}
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
