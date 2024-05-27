
const params = `
  $keyword: String,
  $reportPurpose: String,
  $customerId: String
`;

const paramsDefs = `
  keyword: $keyword,
  reportPurpose: $reportPurpose,
  customerId: $customerId
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
