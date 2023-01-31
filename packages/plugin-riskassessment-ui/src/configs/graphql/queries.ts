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
query RiskIndicatorConfigs (${configParamsDef},${commonPaginateDef}) {
  riskIndicatorConfigs (${configParamValue},${commonPaginateValue}) {
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
    riskIndicatorId
    riskIndicator
    indicatorsGroupId
  }
}
`;

const totalCount = `
query RiskIndicatorConfigsTotalCount (${configParamsDef},${commonPaginateDef}) {
  riskIndicatorConfigsTotalCount(${configParamValue},${commonPaginateValue})
}
`;

export default {
  configs,
  totalCount
};
