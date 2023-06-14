import { commonDateTypes, commonPaginateTypes } from './common';

export const types = `

type PlanSchedule {
    _id:String,
    name: String
    indicatorId: String,
    assignedUserIds:[String]
    structureTypeIds: [String],
    status:String,
    groupId:String,
    date:Date,
    customFieldsData:JSON
}

type Plan {
    _id: String,
    name: String,
    structureType: String,
    configs:JSON,
    createdAt: Date,
    modifiedAt: Date

    schedules:[PlanSchedule]
}
`;

const commonMutationsParams = `
    name:String,
    structureType:String,
    configs:JSON,
`;

const commonScheduleParams = `
    planId:String,
    indicatorId:String,
    groupId:String,
    structureTypeIds:[String],
    date:String,
    assignedUserIds:[String],
    name:String,
    customFieldsData:JSON,
`;

export const mutations = `
    addRiskAssessmentPlan(${commonMutationsParams}):JSON
    updateRiskAssessmentPlan(_id:String,${commonMutationsParams}):JSON
    removeRiskAssessmentPlan(ids:[String]):JSON

    addRiskAssessmentPlanSchedule(${commonScheduleParams}):JSON
    updateRiskAssessmentPlanSchedule(_id:String,${commonScheduleParams}):JSON
    removeRiskAssessmentPlanSchedule(_id:String):JSON
`;

const commonQueriesParams = `
    isArchived:Boolean,
    ${commonPaginateTypes}
    ${commonDateTypes}
`;

export const queries = `
    riskAssessmentPlans(${commonQueriesParams}):JSON
    riskAssessmentPlansTotalCount(${commonQueriesParams}):Int
    riskAssessmentPlan(_id:String):Plan
`;
