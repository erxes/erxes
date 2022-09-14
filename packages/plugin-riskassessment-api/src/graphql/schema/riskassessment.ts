import {
  commonAssessmentCategoryTypes,
  commonPaginateTypes,
  commonRiskAssessmentTypes,
  commonTypes
} from './common';

export const types = `
    input RiskAssessmentInput {
        name: String
        description: String
        categoryId: String
        status: String,
        calculateMethod: String,
        calculateLogics: [CalculateLogicInput]
    }

    input CalculateLogicInput {
        _id: String,
        name: String,
        value: Int
        value2:Int
        logic: String
        color: String
    }
    type CalculateLogicType {
        _id: String,
        name: String,
        value: Int
        value2:Int
        logic: String,
        color: String
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
        statusColor: String
        createdAt:Date
        category:RiskAssessmentCategoryInput
        calculateMethod:String
        calculateLogics:[CalculateLogicType]
    }
    type list {
        list: [RiskAssessment]
        totalCount: Int
    }
`;

export const queries = `
    riskAssessments (categoryId:String,${commonPaginateTypes},status:String):list
    riskAssessmentDetail(_id: String): RiskAssessment
`;
export const mutations = `
    addRiskAssesment (${commonRiskAssessmentTypes}${commonTypes},calculateLogics:[CalculateLogicInput]):JSON
    removeRiskAssessment (_ids:[String]):JSON
    updateRiskAssessment (_id:String,doc:RiskAssessmentInput):JSON
`;
