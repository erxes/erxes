const commonMutationParams = `
  $boardId: String,
  $configs: JSON,
  $customFieldId: String,
  $pipelineId: String,
  $stageId: String,
  $cardType: String,
  $indicatorId:String
  $indicatorIds:[String]
  $groupId:String
`;

const commonMutationParamsDef = `
  boardId: $boardId, 
  configs: $configs, 
  customFieldId: $customFieldId, 
  pipelineId: $pipelineId, 
  stageId: $stageId, 
  cardType: $cardType, 
  indicatorId: $indicatorId,
  indicatorIds: $indicatorIds,
  groupId:$groupId
`;

const addConfig = `
mutation AddRiskAssessmentConfig(${commonMutationParams}) {
  addRiskAssessmentConfig(${commonMutationParamsDef})
}
`;

const updateConfig = `
mutation UpdateRiskAssessmentConfig($configId: String, $doc: RiskIndicatorConfigInput) {
  updateRiskAssessmentConfig(configId: $configId, doc: $doc)
}
`;

const removeConfigs = `
mutation RemoveRiskAssessmentConfigs($configIds: [String]) {
  removeRiskAssessmentConfigs(configIds: $configIds)
}
`;

export default {
  addConfig,
  updateConfig,
  removeConfigs
};
