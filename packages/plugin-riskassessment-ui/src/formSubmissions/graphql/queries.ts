import { commonPaginateDef, commonPaginateValue } from '../../common/graphql';

const conformities = `
query RiskConformities (${commonPaginateDef},$status:String) {
  riskConformities (${commonPaginateValue},status:$status) {
    _id
    cardId
    cardType
    resultScore
    riskAssessment
    riskAssessmentId
    status
    statusColor
    createdAt
    card
  }
}
`;

const totalCount = `
query RiskConformitiesTotalCount (${commonPaginateDef},$status:String) {
  riskConformitiesTotalCount(${commonPaginateValue},status:$status)
}
`;

export default { conformities, totalCount };
