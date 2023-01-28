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
        percentWeight:Int
    }

    type CustomScoreFieldType {
        label:String
        percentWeight:Int
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

    input IIndicatorGroups {
        _id:String,
        indicatorIds:[String]
        calculateLogics:[ICalculateLogic]
        calculateMethod:String
        percentWeight:String
    }

`;

const commonIndicatorParams = `
    categoryIds:[String],
    ignoreIds:[String],
    branchIds:[String],
    departmentIds:[String],
    operationIds:[String],
    ${commonPaginateTypes}
`;

export const queries = `
    riskIndicators (${commonIndicatorParams}):[RiskIndicatorType]
    riskIndicatorsTotalCount(${commonIndicatorParams}):Int

    riskIndicatorsGroups:JSON
    riskIndicatorsGroupsTotalCount:Int

    riskIndicatorDetail(_id: String,fieldsSkip:JSON): RiskIndicatorType
    riskIndicatorConfigs (${configParamsDef},${commonPaginateTypes}):[RiskIndicatorConfigs]
    riskIndicatorConfigsTotalCount(${configParamsDef},${commonPaginateTypes}):Int
`;

const commonIndicatorGroupsParams = `
    _id:String,
    name:String,
    description:String,
    calculateMethod:String,
    calculateLogics:[ICalculateLogic]
    groups:[IIndicatorGroups]
`;

export const mutations = `
    addRiskIndicator (
        ${commonRiskIndicatorTypes}
        ${commonTypes},
        customScoreField:ICustomScoreField,
        calculateLogics:[ICalculateLogic],
        forms:[IRiskIndicatorForm]): JSON
    removeRiskIndicators (_ids:[String]):JSON
    updateRiskIndicator (
        _id:String,
        ${commonRiskIndicatorTypes}
        ${commonTypes},
        customScoreField:ICustomScoreField,
        calculateLogics:[ICalculateLogic],
        forms:[IRiskIndicatorForm]):JSON

    addRiskIndicatorsGroups(${commonIndicatorGroupsParams}):JSON
    updateRiskIndicatorsGroups(${commonIndicatorGroupsParams}):JSON
    removeRiskIndicatorsGroups (ids:[String]):JSON

    
    addRiskIndicatorConfig (${configParams}):JSON
    updateRiskIndicatorConfig(configId:String,doc:RiskIndicatorConfigInput):JSON
    removeRiskIndicatorConfigs(configIds:[String]):JSON
    removeUnusedRiskIndicatorForm(formIds:[String]):JSON
`;
