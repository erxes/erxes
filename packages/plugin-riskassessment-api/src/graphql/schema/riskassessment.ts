import {
  commonAssessmentCategoryTypes,
  commonCalculateLogicParams,
  commonPaginateTypes,
  commonRiskAssessmentFormParams,
  commonRiskAssessmentParams,
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
    configs:JSON,
    riskAssessmentId:String

`;

const configParamsDef = `
cardType:String
boardId:String
pipelineId:String
stageId:String
customFieldId:String
`;

export const types = `
    input IRiskAssessment {
        ${commonRiskAssessmentParams}
        calculateMethod:String
        calculateLogics:[ICalculateLogic]
        forms:[IRiskAssessmentForm]
    }

    type RiskAssessmentType {
        ${commonRiskAssessmentParams}
        createdAt:Date
        categories:[RiskAssessmentCategoryInput]
        calculateMethod:String
        calculateLogics:[CalculateLogicType]
        forms:[RiskAssessmentFormType]
    }
    
    type RiskAssessmentCategoryInput {
        ${commonAssessmentCategoryTypes}
    }

    input IRiskAssessmentForm {
         ${commonRiskAssessmentFormParams}
        calculateLogics:[ICalculateLogic]

    }

    input ICalculateLogic {
        ${commonCalculateLogicParams}
    }

    type CalculateLogicType {
        ${commonCalculateLogicParams}
    }

    type RiskAssessmentFormType {
        ${commonRiskAssessmentFormParams}
        calculateLogics:[CalculateLogicType]
    }

    input RiskAssessmentConfigInput {
        ${configParams}
    }
    
    type RiskAssessmentConfigs {
        ${configParams},
        board:JSON,
        pipeline:JSON,
        stage:JSON,
        field:JSON
        riskAssessment:JSON
    }

    type list {
        list: [RiskAssessmentType]
        totalCount: Int
    }

`;

export const queries = `
    riskAssessments (categoryIds:[String],ignoreIds:[String],${commonPaginateTypes}):[RiskAssessmentType]
    riskAssessmentsTotalCount(categoryIds:[String],ignoreIds:[String],${commonPaginateTypes}):Int
    riskAssessmentDetail(_id: String,fieldsSkip:JSON): RiskAssessmentType
    riskAssessmentConfigs (${configParamsDef},${commonPaginateTypes}):[RiskAssessmentConfigs]
    riskAssessmentConfigsTotalCount(${configParamsDef},${commonPaginateTypes}):Int
`;

export const mutations = `
    addRiskAssesment (${commonRiskAssessmentTypes}${commonTypes},calculateLogics:[ICalculateLogic],forms:[IRiskAssessmentForm]):JSON
    removeRiskAssessment (_ids:[String]):JSON
    updateRiskAssessment (doc:IRiskAssessment):JSON
    addRiskAssesmentConfig (${configParams}):JSON
    updateRiskAssessmentConfig(configId:String,doc:RiskAssessmentConfigInput):JSON
    removeRiskAssessmentConfigs(configIds:[String]):JSON
    removeUnusedRiskAssessmentForm(formIds:[String]):JSON
`;
