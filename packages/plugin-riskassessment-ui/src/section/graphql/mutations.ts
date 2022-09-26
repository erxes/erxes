const confirmityRiskAssessment = `
  mutation AddRiskConfirmity( $riskAssessmentId: String!, $cardId: String!,$cardType: String) {
    addRiskConfirmity( riskAssessmentId: $riskAssessmentId, cardId: $cardId,cardType: $cardType) {
      cardId
      _id
      riskAssessmentId
    }
  }
`;
const editConfimityRiskAssessment = `
  mutation UpdateRiskConfirmity($cardId: String,$cardType:String, $riskAssessmentId: String) {
    updateRiskConfirmity(cardId: $cardId,cardType:$cardType, riskAssessmentId: $riskAssessmentId) {
      _id
      cardId
      cardType
      name
      riskAssessmentId
    }
  }
`;

const removeConfirmityRiskAssessment = `
  mutation RemoveRiskConfirmity($cardId: String,$cardType:String) {
    removeRiskConfirmity(cardId: $cardId,cardType:$cardType) 
  }
`;

const riskFormSaveSubmission = `
  mutation RiskFormSaveSubmissions($cardId: String,$cardType:String, $fieldId: String, $formId: String, $formSubmissions: JSON, $userId: String,$riskAssessmentId:String) {
    riskFormSaveSubmissions(cardId: $cardId,cardType:$cardType ,fieldId: $fieldId, formId: $formId, formSubmissions: $formSubmissions, userId: $userId,riskAssessmentId: $riskAssessmentId)
  }
`;

export default {
  confirmityRiskAssessment,
  editConfimityRiskAssessment,
  removeConfirmityRiskAssessment,
  riskFormSaveSubmission
};
