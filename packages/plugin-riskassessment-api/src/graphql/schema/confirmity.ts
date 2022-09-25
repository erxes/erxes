export const types = `
    type RiskConfirmity {
        _id: String,
        cardId: String,
        riskAssessmentId: String,
        name:String
        statusColor:String
    }
    type RiskConfirmityDetail{
        createdAt: String
        _id: String,
        name: String,
        description: String,
        categoryId: String,
        status: String,
    }
    type RiskConfirmityFormDetailType {
        fields:JSON,
        submissions:JSON,
        formId: String
    }
`;

export const queries = `
    riskConfirmities(cardId:String,riskAssessmentId:String):[RiskConfirmity]
    riskConfirmityDetails(cardId:String) :[RiskConfirmityDetail]
    riskConfirmitySubmissions(dealId:String) :JSON
    riskConfirmityFormDetail(cardId:String,userId: String,riskAssessmentId:String) :RiskConfirmityFormDetailType
`;

export const mutations = `
    addRiskConfirmity (cardId: String,riskAssessmentId: String):RiskConfirmity
    updateRiskConfirmity (cardId: String,riskAssessmentId: String):RiskConfirmity
    removeRiskConfirmity (cardId: String):String
`;
