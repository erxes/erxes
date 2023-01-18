const conformityRiskAssessment = `
  mutation AddRiskConformity( $riskIndicatorIds: [String!], $cardId: String!,$cardType: String) {
    addRiskConformity( riskIndicatorIds: $riskIndicatorIds, cardId: $cardId,cardType: $cardType) {
      cardId
      _id
      riskAssessmentId
    }
  }
`;
const editConformityRiskAssessment = `
  mutation UpdateRiskConformity($cardId: String,$cardType:String, $riskIndicatorIds: [String]) {
    updateRiskConformity(cardId: $cardId,cardType:$cardType, riskIndicatorIds: $riskIndicatorIds) {
      _id
      cardId
      cardType
      riskIndicatorIds
    }
  }
`;

const removeConformityRiskAssessment = `
  mutation RemoveRiskConformity($cardId: String,$cardType:String) {
    removeRiskConformity(cardId: $cardId,cardType:$cardType) 
  }
`;

const riskFormSaveSubmission = `
  mutation RiskFormSaveSubmissions($cardId: String,$cardType:String, $fieldId: String, $formId: String, $formSubmissions: JSON, $userId: String,$riskAssessmentId:String) {
    riskFormSaveSubmissions(cardId: $cardId,cardType:$cardType ,fieldId: $fieldId, formId: $formId, formSubmissions: $formSubmissions, userId: $userId,riskAssessmentId: $riskAssessmentId)
  }
`;

export default {
  conformityRiskAssessment,
  editConformityRiskAssessment,
  removeConformityRiskAssessment,
  riskFormSaveSubmission
};
