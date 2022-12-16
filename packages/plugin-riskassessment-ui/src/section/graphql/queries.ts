import { riskConformityParams } from '../../common/graphql';

const riskAssessments = `
  query RiskAssessments($categoryId: String,,$searchValue: String,$perPage: Int) {
    riskAssessments(categoryId: $categoryId ,perPage: $perPage,searchValue: $searchValue) {
      list{_id,name,description,status,categoryId},totalCount
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
      fields
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
