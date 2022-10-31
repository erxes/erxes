import { riskConfirmityParams } from '../../common/graphql';

const riskAssessments = `
  query RiskAssessments($categoryId: String,,$searchValue: String,$perPage: Int,$status: String) {
    riskAssessments(categoryId: $categoryId ,perPage: $perPage,searchValue: $searchValue,status: $status) {
      list{_id,name,description,status,categoryId},totalCount
    }
  }
  `;
const riskConfirmities = `
  query RiskConfirmities($cardId: String) {
    riskConfirmities(cardId: $cardId) {
      _id
      cardId
      riskAssessmentId
      riskAssessment
    }
  }
`;

const riskConfimityDetails = `
  query RiskConfirmityDetails($cardId: String) {
    riskConfirmityDetails(cardId: $cardId){
      _id
      cardId
      riskAssessmentId
      riskAssessment
    } 
  }`;

const riskConfirmitySubmissions = `
  query RiskConfirmitySubmissions($cardId: String,$cardType:String) {
    riskConfirmitySubmissions(cardId: $cardId, cardType: $cardType)
  }
`;

const riskConfirmityDetail = `
  query RiskConfirmityFormDetail($cardId: String,$userId: String,$riskAssessmentId: String,) {
    riskConfirmityFormDetail(cardId: $cardId, userId: $userId,riskAssessmentId: $riskAssessmentId){
      fields
      formId
      submissions
    }
  }
`;

export default {
  riskAssessments,
  riskConfirmities,
  riskConfimityDetails,
  riskConfirmitySubmissions,
  riskConfirmityDetail
};
