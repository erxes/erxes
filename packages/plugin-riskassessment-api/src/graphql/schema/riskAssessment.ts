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
        indicatorId:String
        indicator:RiskIndicatorType
        groupId:String
        group:IndicatorsGroupType
        riskIndicators:[RiskIndicatorType]
        branchId:String,
        branch: Branch
        departmentId:String,
        department: Department
        operationId:String,
        operation:Operation,
        isSplittedUsers:Boolean,
        permittedUserIds:[String]
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

    type IndicatorAssessment {
        _id:String
        status:String
        statusColor:String
        resultScore:String,
        assessmentId:String
        indicatorId:String

        indicator:RiskIndicatorType

        createdAt:Date
        closedAt:Date
        submissions:[IndicatorSubmissions]
    }

    type IndicatorSubmissions {
        _id:String
        user:User
        fields:JSON
    }

    input GroupsAssignedUsers {
        groupId:String
        assignedUserIds:[String]
    }

    input IBulkAddAssessment {
        branchIds:[String]
        departmentIds:[String]
        operationIds:[String]
        indicatorIds:[String]
        groupId:String
        indicatorId:String
        groupsAssignedUsers:[GroupsAssignedUsers]
    }

    input CardFilter {
        name:String,
        value:String
        values:[String]
        regex:Boolean
    }

`;

const commonMutationParams = `
    cardId:String,
    cardType:String,
    groupId:String
    indicatorId: String
    operationId:String
    branchId:String
    departmentId:String
    groupsAssignedUsers:[GroupsAssignedUsers]
    permittedUserIds:[String]
`;

export const mutations = `
    addRiskAssessment(${commonMutationParams}):RiskAssessment
    addBulkRiskAssessment(cardId:String,cardType:String,bulkItems:[IBulkAddAssessment]):[RiskAssessment]
    editRiskAssessment(_id:String,${commonMutationParams}):RiskAssessment
    removeRiskAssessment(riskAssessmentId:String):RiskAssessment
    removeRiskAssessments(ids:[String]):JSON
`;

const commonParams = `
    cardType:String,
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
    sortField:String
    sortDirection:Int
    tagIds:[String]
    groupIds:[String]
    customFieldsValues:[String]
    cardFilter:CardFilter
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

    riskAssessmentDetail(id:String,showFlagged:Boolean):JSON

    riskAssessmentFormSubmissionDetail(${commonFormSubmitParams}):JSON
    
    riskAssessment(cardId:String,cardType:String):[RiskAssessment]

    riskAssessmentAssignedMembers(cardId:String,cardType:String):[User]

    riskAssessmentSubmitForm(cardId:String,cardType:String,riskAssessmentId:String,userId:String):JSON

    riskAssessmentIndicatorForm(riskAssessmentId:String,indicatorId:String,userId:String):JSON

    riskAssessmentGroups(riskAssessmentId:String,groupIds:[String] ):JSON
    
    indicatorsAssessmentHistory(indicatorId:String,branchId:String,departmentId:String,operationId:String):[IndicatorAssessment]
`;
