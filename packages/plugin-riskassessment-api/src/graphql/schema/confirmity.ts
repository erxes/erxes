import { commonPaginateTypes, commonTypes } from './common';

export const types = `
    type RiskConformity {
        _id: String,
        cardId: String,
        cardType: String,
        createdAt: Date,
        closedAt: Date,
        riskAssessmentId: String,
        riskAssessment: JSON
        riskIndicatorId:String
        groupId:String
        branchIds:[String]
        departmentIds:[String]
        operationIds:[String]
        riskIndicators:JSON
        card:JSON
    }
    type RiskConformityDetail{
        createdAt: String
        _id: String,
        name: String,
        description: String,
        categoryId: String,
        status: String,
    }
    type RiskConformityFormDetailType {
        indicatorId: String
        indicator:RiskIndicatorType,
        indicators:[RiskIndicatorType],
        fields:JSON,
        submissions:JSON,
        formId: String,
    }
`;

const conformityParams = `
    cardType:String,
    riskIndicatorId:String,
    status:String,
    createdFrom: String,
    createdTo: String,
    closedFrom: String,
    closedTo: String
    ${commonTypes},
    ${commonPaginateTypes}
`;

export const queries = `
    riskConformity(cardId:String,cardTyp:String,riskIndicatorId:String):RiskConformity
    riskConformities(${conformityParams}):[RiskConformity]
    riskConformitiesTotalCount(${conformityParams}): Int
    riskConformityDetail(cardId:String) :RiskConformity
    riskConformitySubmissions(cardId:String,cardType:String) :JSON
    riskConformityFormDetail(cardId:String,cardType:String,userId: String,riskAssessmentId:String,riskIndicatorId:String,customScore:Int) :RiskConformityFormDetailType
`;

const commonConformityParams = `
    cardId: String,
    cardType:String,
    groupId:String
    indicatorId: String
    operationIds:[String]
    branchIds:[String]
    departmentIds:[String]
`;

export const mutations = `
    addRiskConformity (${commonConformityParams}):RiskConformity
    updateRiskConformity (${commonConformityParams}):RiskConformity
    removeRiskConformity (cardId: String,cardType:String):String
`;
