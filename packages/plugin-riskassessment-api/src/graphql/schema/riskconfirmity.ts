
export const types = `
    type RiskConfirmity {
        _id: String,
        cardId: String,
        riskAssessmentId: String,
        name: String,
    }
`;

export const queries = `
    riskConfirmities(cardId:String,riskAssessmentId:String):[RiskConfirmity]
    riskConfirmityDetails(cardId:String) :JSON
`;

export const mutations = `
    addRiskConfirmity (cardId: String,riskAssessmentId: String,):RiskConfirmity
    updateRiskConfirmity (cardId: String,riskAssessmentId: String):RiskConfirmity
    removeRiskConfirmity (cardId: String):String
`;
