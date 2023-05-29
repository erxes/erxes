import {
  commonCalculateLogicParams,
  commonDateTypes,
  commonIndicatorTypes,
  commonPaginateTypes,
  commonRiskIndicatorFormParams,
  commonRiskIndicatorParams
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
    indicatorId:String
    indicatorIds:[String]
    groupId:String

`;

const configParamsDef = `
cardType:String
boardId:String
pipelineId:String
stageId:String
customFieldId:String
`;

export const types = tagsAvailable => `

    input IRiskIndicator  {
        ${commonRiskIndicatorParams}
        calculateMethod:String
        calculateLogics:[ICalculateLogic]
        forms:[IRiskIndicatorForm]
    }
    
    type RiskIndicatorType {
        ${commonRiskIndicatorParams}
        createdAt:Date
        modifiedAt:Date
        calculateMethod:String
        calculateLogics:[CalculateLogicType]
        forms:[RiskIndicatorFormType]
        isWithDescription:Boolean
        ${tagsAvailable ? `tags:[Tag]` : ''}
        
    }
    

    input IRiskIndicatorForm {
         ${commonRiskIndicatorFormParams}
         calculateLogics:[ICalculateLogic]

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

    input IIndicatorGroups {
        _id:String,
        name:String,
        indicatorIds:[String]
        calculateLogics:[ICalculateLogic]
        calculateMethod:String
        percentWeight:Float
    }

    type GroupsOfGroupTypes {
        _id:String
        name:String
        indicatorIds:[String]
        calculateLogics:[CalculateLogicType]
        calculateMethod:String
        percentWeight:Float
    }

    type IndicatorsGroupType {
        _id:String,
        name:String,
        description:String
        tagIds:[String]
        ${tagsAvailable ? `tags:[Tag]` : ''}
        calculateMethod:String,
        calculateLogics:[CalculateLogicType]
        groups:[GroupsOfGroupTypes]
        createdAt:Date
        modifiedAt:Date
        ignoreZeros:Boolean
    }

`;

const commonIndicatorParams = `
    ids:[String],
    tagIds:[String],
    ignoreIds:[String],
    branchIds:[String],
    departmentIds:[String],
    operationIds:[String],
    ${commonPaginateTypes}
`;

const commonIndicatorGroupsParams = `
    ids:[String],
    searchValue:String,
    tagIds:[String]
    perPage:Int
    page:Int
`;

export const queries = `
    riskIndicators (${commonIndicatorParams}):[RiskIndicatorType]
    riskIndicatorsTotalCount(${commonIndicatorParams}):Int

    riskIndicatorsGroups(${commonIndicatorGroupsParams}):[IndicatorsGroupType]
    riskIndicatorsGroupsTotalCount(${commonIndicatorGroupsParams}):Int
    riskIndicatorsGroup(_id:String):IndicatorsGroupType

    riskIndicatorDetail(_id: String,fieldsSkip:JSON): RiskIndicatorType
    riskAssessmentsConfigs (${configParamsDef},${commonPaginateTypes}):[RiskIndicatorConfigs]
    riskAssessmentsConfigsTotalCount(${configParamsDef},${commonPaginateTypes}):Int
`;

const commonIndicatorGroupsMutationsParams = `
    _id:String,
    name:String,
    description:String,
    tagIds:[String],
    calculateMethod:String,
    calculateLogics:[ICalculateLogic]
    groups:[IIndicatorGroups]
    ignoreZeros:Boolean
`;

export const mutations = `
    addRiskIndicator (
        ${commonIndicatorTypes}
        ${commonDateTypes},
        calculateLogics:[ICalculateLogic],
        forms:[IRiskIndicatorForm]): JSON
    removeRiskIndicators (_ids:[String]):JSON
    updateRiskIndicator (
        _id:String,
        ${commonIndicatorTypes}
        ${commonDateTypes},
        calculateLogics:[ICalculateLogic],
        forms:[IRiskIndicatorForm]):JSON
    removeRiskIndicatorUnusedForms (formIds:[String]) :JSON

    addRiskIndicatorsGroups(${commonIndicatorGroupsMutationsParams}):JSON
    updateRiskIndicatorsGroups(${commonIndicatorGroupsMutationsParams}):JSON
    removeRiskIndicatorsGroups (ids:[String]):JSON

    
    addRiskAssessmentConfig (${configParams}):JSON
    updateRiskAssessmentConfig(configId:String,doc:RiskIndicatorConfigInput):JSON
    removeRiskAssessmentConfigs(configIds:[String]):JSON
    removeUnusedRiskIndicatorForm(formIds:[String]):JSON
`;
