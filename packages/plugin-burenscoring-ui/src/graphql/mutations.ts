
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
export default {
  toCheckScoring
};
