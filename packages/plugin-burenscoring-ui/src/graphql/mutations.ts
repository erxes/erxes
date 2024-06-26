
const params = `
  $keyword: String,
  $reportPurpose: String,
  $customerId: String,
  $vendor: String
`;

const paramsDefs = `
  keyword: $keyword,
  reportPurpose: $reportPurpose,
  customerId: $customerId,
  vendor: $vendor
`;
const toCheckScoring = `
mutation toCheckScore(${params}) {
  toCheckScore(${paramsDefs})
  }
`;

const updateScoringConfigs = `
  mutation configsUpdate($configsMap: JSON!) {
    configsUpdate(configsMap: $configsMap)
  }
`;

export default {
  toCheckScoring,
  updateScoringConfigs
};
