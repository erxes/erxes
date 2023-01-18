const addConfig = `
mutation AddRiskIndicatorConfig($boardId: String, $configs: JSON, $customFieldId: String, $pipelineId: String, $stageId: String, $cardType: String, $riskIndicatorId:String) {
  addRiskIndicatorConfig(boardId: $boardId, configs: $configs, customFieldId: $customFieldId, pipelineId: $pipelineId, stageId: $stageId, cardType: $cardType, riskIndicatorId: $riskIndicatorId)
}
`;

const updateConfig = `
mutation UpdateRiskIndicatortConfig($configId: String, $doc: RiskIndicatortConfigInput) {
  updateRiskIndicatortConfig(configId: $configId, doc: $doc)
}
`;

const removeConfigs = `
mutation RemoveRiskIndicatortConfigs($configIds: [String]) {
  removeRiskIndicatortConfigs(configIds: $configIds)
}
`;

export default {
  addConfig,
  updateConfig,
  removeConfigs
};
