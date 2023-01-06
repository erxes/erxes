import { commonPaginateDef, commonPaginateValue } from '../../common/graphql';

const paramsDef = `
  ${commonPaginateDef},
  $riskAssessmentId:String,
  $cardType: String,
  $createdFrom: String,
  $createdTo: String,
  $closedFrom: String,
  $closedTo: String
`;

const paramsValue = `
  ${commonPaginateValue},
  riskAssessmentId:$riskAssessmentId,
  cardType:$cardType,
  createdFrom:$createdFrom
  createdTo:$createdTo
  closedFrom:$closedFrom
  closedTo:$closedTo
`;

const conformities = `
query RiskConformities (${paramsDef},$status:String) {
  riskConformities (${paramsValue},status:$status) {
    _id
    cardId
    cardType
    resultScore
    riskAssessment
    riskAssessmentId
    status
    statusColor
    createdAt
    closedAt
    card
  }
}
`;

const totalCount = `
query RiskConformitiesTotalCount (${paramsDef},$status:String) {
  riskConformitiesTotalCount(${paramsValue},status:$status)
}
`;

export default { conformities, totalCount };
