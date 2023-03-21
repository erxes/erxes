import { commonPaginateDef, commonPaginateValue } from '../../common/graphql';

const configParamsDef = `
$cardType:String
$boardId:String
$pipelineId:String
$stageId:String
$customFieldId:String
`;

const configParamValue = `
cardType:$cardType
boardId:$boardId
pipelineId:$pipelineId
stageId:$stageId
customFieldId:$customFieldId
`;

const configs = `
query RiskAssessmentsConfigs (${configParamsDef},${commonPaginateDef}) {
  riskAssessmentsConfigs (${configParamValue},${commonPaginateValue}) {
    _id
    board
    boardId
    cardType
    configs
    field
    customFieldId
    pipeline
    pipelineId
    stage
    stageId
    createdAt
    modifiedAt
    indicatorId
    riskIndicator
    groupId
  }
}
`;

const totalCount = `
query RiskAssessmentsConfigsTotalCount (${configParamsDef},${commonPaginateDef}) {
  riskAssessmentsConfigsTotalCount(${configParamValue},${commonPaginateValue})
}
`;

export default {
  configs,
  totalCount
};
