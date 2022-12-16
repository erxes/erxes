import {
  commonAssessmentCategoryTypes,
  commonPaginateTypes,
  commonRiskAssessmentTypes,
  commonTypes
} from './common';

const configParams = `
    _id:String,
    cardType:String,
    boardId: String,
    pipelineId:String,
    stageId:String,
    customFieldId:String,
    createdAt:Date,
    modifiedAt:Date,
    configs:JSON

`;

const configParamsDef = `
cardType:String
boardId:String
pipelineId:String
stageId:String
customFieldId:String
`;

export const types = `
    input RiskAssessmentInput {
        name: String
        description: String
        categoryId: String
        status: String,
        calculateMethod: String,
        calculateLogics: [CalculateLogicInput]
    }

    input RiskAssessmentConfigInput {
        ${configParams}
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
        resultScore:Int
        category:RiskAssessmentCategoryInput
        calculateMethod:String
        calculateLogics:[CalculateLogicType]
    }
    type list {
        list: [RiskAssessment]
        totalCount: Int
    }

    type RiskAssessmentConfigs {
        ${configParams},
        board:JSON,
        pipeline:JSON,
        stage:JSON,
        field:JSON
    }
`;

export const queries = `
    riskAssessments (categoryId:String,ignoreIds:[String],${commonPaginateTypes}):list
    riskAssessmentDetail(_id: String,fieldsSkip:JSON): RiskAssessment
    riskAssessmentConfigs (${configParamsDef},${commonPaginateTypes}):[RiskAssessmentConfigs]
    riskAssessmentConfigsTotalCount(${configParamsDef},${commonPaginateTypes}):Int
`;

export const mutations = `
    addRiskAssesment (${commonRiskAssessmentTypes}${commonTypes},calculateLogics:[CalculateLogicInput]):JSON
    removeRiskAssessment (_ids:[String]):JSON
    updateRiskAssessment (_id:String,doc:RiskAssessmentInput):JSON
    addRiskAssesmentConfig (${configParams}):JSON
    updateRiskAssessmentConfig(configId:String,doc:RiskAssessmentConfigInput):JSON
    removeRiskAssessmentConfigs(configIds:[String]):JSON
`;
