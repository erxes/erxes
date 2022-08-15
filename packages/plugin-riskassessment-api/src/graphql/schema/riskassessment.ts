import { commonRiskAssessmentTypes, commonTypes } from './common';

export const types = `
    input RiskAssessmentInput {
        name: String
        description: String
        categoryId: String
        status: String
    }
    type RiskAssessment {
        _id: String
        name: String
        description: String
        categoryId: String
        status: String
    }
    type list {
        list: [RiskAssessment]
        totalCount: Int
    }
`;

export const queries = `
    riskAssesments:list
`;
export const mutations = `
    addRiskAssesment (${commonRiskAssessmentTypes}${commonTypes}):JSON
    removeRiskAssessment (_ids:[String]):JSON
    updateRiskAssessment (_id:String,doc:RiskAssessmentInput):JSON
`;
