const confirmityRiskAssessment = `
  mutation AddRiskConfirmity( $riskAssessmentId: String!, $cardId: String!) {
    addRiskConfirmity( riskAssessmentId: $riskAssessmentId, cardId: $cardId) {
      cardId
      _id
      riskAssessmentId
    }
  }
`;
const editConfimityRiskAssessment = `
  mutation UpdateRiskConfirmity($cardId: String, $riskAssessmentId: String) {
    updateRiskConfirmity(cardId: $cardId, riskAssessmentId: $riskAssessmentId) {
      _id
      cardId
      name
      riskAssessmentId
    }
  }
`;

const removeConfirmityRiskAssessment = `
  mutation RemoveRiskConfirmity($cardId: String) {
    removeRiskConfirmity(cardId: $cardId)
  }
`;

const formSubmissionsSave = `
mutation FormSubmissionsSave($contentType: String, $contentTypeId: String, $formId: String, $formSubmissions: JSON,$userId:String) {
  formSubmissionsSave(contentType: $contentType, contentTypeId: $contentTypeId, formId: $formId, formSubmissions: $formSubmissions,userId: $userId)
}
`;

export default {
  confirmityRiskAssessment,
  editConfimityRiskAssessment,
  removeConfirmityRiskAssessment,
  formSubmissionsSave
};
