import { riskConformityParams } from '../../common/graphql';

const riskIndicators = `
  query RiskIndicators($categoryIds: [String],,$searchValue: String,$perPage: Int) {
    riskIndicators(categoryIds: $categoryIds ,perPage: $perPage,searchValue: $searchValue) {
      _id,name,description,categoryIds
    }
  }
  `;
const riskConformity = `
  query riskConformity($cardId: String) {
    riskConformity(cardId: $cardId) {
      _id
      cardId
      riskIndicatorIds
      riskIndicators
      riskAssessmentId
      riskAssessmentId
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
      riskIndicatorIds
      riskIndicators
    } 
  }`;

const riskConformitySubmissions = `
  query RiskConformitySubmissions($cardId: String,$cardType:String) {
    riskConformitySubmissions(cardId: $cardId, cardType: $cardType)
  }
`;

const riskConformityFormDetail = `
  query RiskConformityFormDetail($cardId: String,$userId: String,$riskAssessmentId: String,) {
    riskConformityFormDetail(cardId: $cardId, userId: $userId,riskAssessmentId: $riskAssessmentId){
      forms
      formId
      submissions
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
