const addConfig = `
mutation AddRiskAssesmentConfig($boardId: String, $configs: JSON, $customFieldId: String, $pipelineId: String, $stageId: String, $cardType: String, $riskAssessmentId:String) {
  addRiskAssesmentConfig(boardId: $boardId, configs: $configs, customFieldId: $customFieldId, pipelineId: $pipelineId, stageId: $stageId, cardType: $cardType, riskAssessmentId: $riskAssessmentId)
}
`;

const updateConfig = `
mutation UpdateRiskAssessmentConfig($configId: String, $doc: RiskAssessmentConfigInput) {
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
