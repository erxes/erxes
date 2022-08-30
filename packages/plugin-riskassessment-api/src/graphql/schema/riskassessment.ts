import {
  commonAssessmentCategoryTypes,
  commonPaginateTypes,
  commonRiskAssessmentTypes,
  commonTypes,
} from './common';

export const types = `
    input RiskAssessmentInput {
        name: String
        description: String
        categoryId: String
        status: String
    }

    type RiskAssessmentCategoryInput {
        ${commonAssessmentCategoryTypes}
    }

    type RiskAssessment {
        _id: String
        name: String
        description: String
        categoryId: String
        status: String
        createdAt:Date
        category:RiskAssessmentCategoryInput
    }
    type list {
        list: [RiskAssessment]
        totalCount: Int
    }
`;

export const queries = `
    riskAssesments (categoryId:String,${commonPaginateTypes}):list
    riskAssessmentDetail(_id: String): RiskAssessment
`;
export const mutations = `
    addRiskAssesment (${commonRiskAssessmentTypes}${commonTypes}):JSON
    removeRiskAssessment (_ids:[String]):JSON
    updateRiskAssessment (_id:String,doc:RiskAssessmentInput):JSON
`;
