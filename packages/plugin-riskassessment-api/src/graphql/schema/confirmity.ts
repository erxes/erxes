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
        riskIndicatorIds:[String]
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
        forms:JSON,
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
    riskConformityFormDetail(cardId:String,cardType:String,userId: String,riskIndicatorId:String) :RiskConformityFormDetailType
`;

export const mutations = `
    addRiskConformity (cardId: String,cardType:String,riskIndicatorIds: [String]):RiskConformity
    updateRiskConformity (cardId: String,cardType:String,riskIndicatorIds: [String]):RiskConformity
    removeRiskConformity (cardId: String,cardType:String):String
`;
