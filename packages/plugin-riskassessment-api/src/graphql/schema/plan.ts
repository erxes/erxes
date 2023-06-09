import { commonDateTypes, commonPaginateTypes } from './common';

export const types = `
`;

export const mutations = `
`;

const commonQueriesParams = `
${commonPaginateTypes}
${commonDateTypes}
`;

export const queries = `
    riskAssessmentPlans(${commonQueriesParams}):JSON
    riskAssessmentPlansTotalCount(${commonQueriesParams}):Int
    riskAssessmentPlan(_id:String):JSON
`;
