const confirmityRiskAssessment = `
  mutation AddRiskConfirmity( $riskAssessmentId: String!, $cardId: String!) {
    addRiskConfirmity( riskAssessmentId: $riskAssessmentId, cardId: $cardId) {
      cardId
      _id
      riskAssessmentId
    }
  }
`
const editConfimityRiskAssessment = `
  mutation UpdateRiskConfirmity($cardId: String, $riskAssessmentId: String) {
    updateRiskConfirmity(cardId: $cardId, riskAssessmentId: $riskAssessmentId) {
      _id
      cardId
      name
      riskAssessmentId
    }
  }
`

const removeConfirmityRiskAssessment = `
  mutation RemoveRiskConfirmity($cardId: String) {
    removeRiskConfirmity(cardId: $cardId)
  }
`
export default {confirmityRiskAssessment,
    editConfimityRiskAssessment,
    removeConfirmityRiskAssessment}