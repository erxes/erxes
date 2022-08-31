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
    riskConfirmityDetails(cardId: $cardId)
  }`;

const riskConfirmitySubmissions = `
  query Query($dealId: String) {
    riskConfirmitySubmissions(dealId: $dealId)
  }
`;

export default {
  riskAssessments,
  riskConfirmities,
  riskConfimityDetails,
  riskConfirmitySubmissions,
};
