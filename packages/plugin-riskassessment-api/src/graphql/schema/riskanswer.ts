import { commonRiskConfirmityTypes } from './common';

export const type = `
    input RiskAnswer {
        _id: String,
        name: String,
        categoryId: String,
        value:Int
    }
`;

export const queries = `
    riskAnswers (${commonRiskConfirmityTypes}):RiskAnswer
`;

export const mutations = `
    riskAnswerAdd (${commonRiskConfirmityTypes}):RiskConfirmity
`;
