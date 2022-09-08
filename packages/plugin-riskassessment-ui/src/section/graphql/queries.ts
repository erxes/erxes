import { riskConfirmityParams } from '../../common/graphql';

const riskAssessments = `
  query RiskAssesments($categoryId: String,,$searchValue: String,$perPage: Int) {
    riskAssesments(categoryId: $categoryId ,perPage: $perPage,searchValue: $searchValue) {
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
      name
    }
  }
`;

const riskConfimityDetails = `
  query RiskConfirmityDetails($cardId: String) {
    riskConfirmityDetails(cardId: $cardId){
      ${riskConfirmityParams}
    } 
  }`;

const riskConfirmitySubmissions = `
  query RiskConfirmitySubmissions($dealId: String) {
    riskConfirmitySubmissions(dealId: $dealId)
  }
`;

const riskConfirmityDetail = `
  query RiskConfirmityFormDetail($cardId: String,$userId: String) {
    riskConfirmityFormDetail(cardId: $cardId, userId: $userId){
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
