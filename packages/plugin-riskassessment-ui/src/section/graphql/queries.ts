import { riskConformityParams } from '../../common/graphql';

const commonIndicatorParams = `
  $departmentIds:[String]
  $branchIds:[String]
  $operationIds:[String],
  $categoryIds: [String],
  $searchValue: String,
  $perPage: Int
`;

const commonIndicatorParamsDef = `
  categoryIds: $categoryIds ,
  perPage: $perPage,
  searchValue: $searchValue,
  branchIds: $branchIds,
  departmentIds: $departmentIds
  operationIds: $operationIds
`;

const riskIndicators = `
  query RiskIndicators(${commonIndicatorParams}) {
    riskIndicators(${commonIndicatorParamsDef}) {
      _id,name,description,categoryId
    }
  }
  `;
const riskConformity = `
  query riskConformity($cardId: String) {
    riskConformity(cardId: $cardId) {
      _id
      cardId
      riskAssessmentId
      riskAssessment
    }
  }
`;

const riskConformityDetail = `
  query RiskConformityDetail($cardId: String) {
    riskConformityDetail(cardId: $cardId){
      _id
      cardId
      riskAssessmentId
      riskAssessment
      riskIndicatorId
      groupId
      riskIndicators
      operationIds
      branchIds
      departmentIds
    } 
  }`;

const riskConformitySubmissions = `
  query RiskConformitySubmissions($cardId: String,$cardType:String) {
    riskConformitySubmissions(cardId: $cardId, cardType: $cardType)
  }
`;

const riskConformityFormDetail = `
  query RiskConformityFormDetail($cardId: String,$userId: String,$riskAssessmentId: String,$riskIndicatorId:String) {
    riskConformityFormDetail(cardId: $cardId, userId: $userId,riskAssessmentId: $riskAssessmentId,riskIndicatorId: $riskIndicatorId){
      fields
      indicatorId
      indicator {
        customScoreField {
          label
          percentWeight
        }
      }
      submissions
      indicators {
        _id
        name
      }
    }
  }
`;

export default {
  riskIndicators,
  riskConformity,
  riskConformityDetail,
  riskConformitySubmissions,
  riskConformityFormDetail
};
