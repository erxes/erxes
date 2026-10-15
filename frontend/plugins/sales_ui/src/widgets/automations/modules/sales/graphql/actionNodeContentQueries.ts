import { gql } from '~/gql';

export const GET_BOARD_PIPELINE_STAGE_NAME = gql(`
  query salesAutomationBoardPipelineStageNames(
    $boardId: String!
    $pipelineId: String!
    $stageId: String!
  ) {
    salesBoardDetail(_id: $boardId) {
      name
    }
    salesPipelineDetail(_id: $pipelineId) {
      name
    }
    salesStageDetail(_id: $stageId) {
      name
    }
  }
`);
