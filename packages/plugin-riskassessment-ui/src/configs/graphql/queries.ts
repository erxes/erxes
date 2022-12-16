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
query RiskAssessmentConfigs (${configParamsDef},${commonPaginateDef}) {
  riskAssessmentConfigs (${configParamValue},${commonPaginateValue}) {
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
  }
}
`;

const totalCount = `
query RiskAssessmentConfigsTotalCount (${configParamsDef},${commonPaginateDef}) {
  riskAssessmentConfigsTotalCount(${configParamValue},${commonPaginateValue})
}
`;

export default {
  configs,
  totalCount
};
