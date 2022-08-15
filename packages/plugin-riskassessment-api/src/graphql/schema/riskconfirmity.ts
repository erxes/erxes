import { commonRiskConfirmityTypes } from './common';

export const type = `
    input RiskConfimity {
        _id: String,
        cardId: String,
        riskAssessmentId: String,
    }
`;

export const queries = `
    RiskConfirmitys (${commonRiskConfirmityTypes}):RiskConfirmity
`;

export const mutations = `
    RiskConfirmityAdd (${commonRiskConfirmityTypes}):RiskConfirmity
`;
