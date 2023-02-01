const commonMutationParams = `
  $boardId: String,
  $configs: JSON,
  $customFieldId: String,
  $pipelineId: String,
  $stageId: String,
  $cardType: String,
  $riskIndicatorId:String
  $indicatorsGroupId:String
`;

const commonMutationParamsDef = `
  boardId: $boardId, 
  configs: $configs, 
  customFieldId: $customFieldId, 
  pipelineId: $pipelineId, 
  stageId: $stageId, 
  cardType: $cardType, 
  riskIndicatorId: $riskIndicatorId,
  indicatorsGroupId:$indicatorsGroupId
`;

const addConfig = `
mutation AddRiskIndicatorConfig(${commonMutationParams}) {
  addRiskIndicatorConfig(${commonMutationParamsDef})
}
`;

const updateConfig = `
mutation UpdateRiskIndicatorConfig($configId: String, $doc: RiskIndicatorConfigInput) {
  updateRiskIndicatorConfig(configId: $configId, doc: $doc)
}
`;

const removeConfigs = `
mutation RemoveRiskIndicatorConfigs($configIds: [String]) {
  removeRiskIndicatorConfigs(configIds: $configIds)
}
`;

export default {
  addConfig,
  updateConfig,
  removeConfigs
};
