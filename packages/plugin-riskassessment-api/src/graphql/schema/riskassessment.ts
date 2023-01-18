import {
  commonAssessmentCategoryTypes,
  commonCalculateLogicParams,
  commonPaginateTypes,
  commonRiskIndicatorFormParams,
  commonRiskIndicatorParams,
  commonRiskIndicatorTypes,
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
    riskIndicatorId:String

`;

const configParamsDef = `
cardType:String
boardId:String
pipelineId:String
stageId:String
customFieldId:String
`;

export const types = `
    input IRiskIndicator {
        ${commonRiskIndicatorParams}
        customScoreField:ICustomScoreField
        calculateMethod:String
        calculateLogics:[ICalculateLogic]
        forms:[IRiskIndicatorForm]
    }

    type RiskIndicatorType {
        ${commonRiskIndicatorParams}
        createdAt:Date
        categories:[RiskIndicatorCategoryInput]
        customScoreField:CustomScoreFieldType
        calculateMethod:String
        calculateLogics:[CalculateLogicType]
        forms:[RiskIndicatorFormType]
    }
    
    type RiskIndicatorCategoryInput {
        ${commonAssessmentCategoryTypes}
    }

    input IRiskIndicatorForm {
         ${commonRiskIndicatorFormParams}
        calculateLogics:[ICalculateLogic]

    }

    input ICustomScoreField {
        label:String
        percentWeigth:Int
    }

    type CustomScoreFieldType {
        label:String
        percentWeigth:Int
    }

    input ICalculateLogic {
        ${commonCalculateLogicParams}
    }

    type CalculateLogicType {
        ${commonCalculateLogicParams}
    }

    type RiskIndicatorFormType {
        ${commonRiskIndicatorFormParams}
        calculateLogics:[CalculateLogicType]
    }

    input RiskIndicatorConfigInput {
        ${configParams}
    }
    
    type RiskIndicatorConfigs {
        ${configParams},
        board:JSON,
        pipeline:JSON,
        stage:JSON,
        field:JSON
        riskIndicator:JSON
    }

    type list {
        list: [RiskIndicatorType]
        totalCount: Int
    }

`;

export const queries = `
    riskIndicators (categoryIds:[String],ignoreIds:[String],${commonPaginateTypes}):[RiskIndicatorType]
    riskIndicatorsTotalCount(categoryIds:[String],ignoreIds:[String],${commonPaginateTypes}):Int
    riskIndicatorDetail(_id: String,fieldsSkip:JSON): RiskIndicatorType
    riskIndicatorConfigs (${configParamsDef},${commonPaginateTypes}):[RiskIndicatorConfigs]
    riskIndicatorConfigsTotalCount(${configParamsDef},${commonPaginateTypes}):Int
`;

export const mutations = `
    addRiskIndicator (
        ${commonRiskIndicatorTypes}
        ${commonTypes},
        customScoreField:ICustomScoreField,
        calculateLogics:[ICalculateLogic],
        forms:[IRiskIndicatorForm]): JSON
    removeRiskIndicator (_ids:[String]):JSON
    updateRiskIndicator (doc:IRiskIndicator):JSON
    addRiskIndicatorConfig (${configParams}):JSON
    updateRiskIndicatorConfig(configId:String,doc:RiskIndicatorConfigInput):JSON
    removeRiskIndicatorConfigs(configIds:[String]):JSON
    removeUnusedRiskIndicatorForm(formIds:[String]):JSON
`;
