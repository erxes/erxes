export const types = `

    type CardType  {
        _id: String,
        name: String,
    }
    type RiskAssessment {
        _id: String
        cardId:String
        cardType:String
        card:CardType
        status: String
        statusColor: String
        resultScore: String
        createdAt: Date
        closedAt: Date
        riskIndicatorId:String
        riskIndicators:[RiskIndicatorType]
        branchIds:[String],
        branches: JSON
        departmentIds:[String],
        departments: JSON
        operationIds:[String],
        operations:JSON
    }

    type RiskAssessmentDetail  {
        status:String
        statusColor:String
        resultScore:String
        assessmentId:String
        assessment:JSON
        indicator:JSON
        indicatorId:String
    }

`;

const commonMutationParams = `
    cardId:String,
    cardType:String,
    groupId:String
    indicatorId: String
    operationIds:[String]
    branchIds:[String]
    departmentIds:[String]
`;

export const mutations = `
    addRiskAssessment(${commonMutationParams}):RiskAssessment
    editRiskAssessment(_id:String,${commonMutationParams}):RiskAssessment
    removeRiskAssessment(riskAssessmentId:String):RiskAssessment
`;

const commonParams = `
    status:String
    searchValue:String
    createdAtFrom:String
    createdAtTo:String
    closedAtFrom:String
    closedAtTo:String
    riskIndicatorIds:[String]
    branchIds:[String]
    departmentIds:[String]
    operationIds:[String]
    perPage:Int
    page:Int
`;

const commonFormSubmitParams = `
    cardId:String
    cardType:String
    riskAssessmentId:String
    indicatorId:String
`;

export const queries = `
    riskAssessments(${commonParams}):[RiskAssessment]
    riskAssessmentsTotalCount(${commonParams}):Int
    riskAssessmentDetail(id:String):JSON
    riskAssessmentFormSubmissionDetail(${commonFormSubmitParams}):JSON
    riskAssessment(cardId:String,cardType:String):JSON
    riskAssessmentAssignedMembers(cardId:String,cardType:String,riskAssessmentId:String):JSON
    riskAssessmentSubmitForm(cardId:String,cardType:String,riskAssessmentId:String,userId:String):JSON
    riskAssessmentIndicatorForm(riskAssessmentId:String,indicatorId:String,userId:String):JSON
`;
