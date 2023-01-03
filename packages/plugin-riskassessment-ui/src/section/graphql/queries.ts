import { riskConformityParams } from '../../common/graphql';

const riskAssessments = `
  query RiskAssessments($categoryIds: [String],,$searchValue: String,$perPage: Int) {
    riskAssessments(categoryIds: $categoryIds ,perPage: $perPage,searchValue: $searchValue) {
      _id,name,description,categoryIds
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
      status
      statusColor
      resultScore
    }
  }
`;

const riskConformityDetails = `
  query RiskConformityDetails($cardId: String) {
    riskConformityDetails(cardId: $cardId){
      _id
      cardId
      riskAssessmentId
      riskAssessment
    } 
  }`;

const riskConformitySubmissions = `
  query RiskConformitySubmissions($cardId: String,$cardType:String) {
    riskConformitySubmissions(cardId: $cardId, cardType: $cardType)
  }
`;

const riskConformityDetail = `
  query RiskConformityFormDetail($cardId: String,$userId: String,$riskAssessmentId: String,) {
    riskConformityFormDetail(cardId: $cardId, userId: $userId,riskAssessmentId: $riskAssessmentId){
      forms
      formId
      submissions
    }
  }
`;

export default {
  riskAssessments,
  riskConformity,
  riskConformityDetails,
  riskConformitySubmissions,
  riskConformityDetail
};
