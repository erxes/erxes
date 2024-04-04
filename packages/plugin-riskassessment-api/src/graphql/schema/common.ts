export const commonDateTypes = `
    createdAt:String
    modifiedAt:String
`;

export const commonPaginateTypes = `
    page:Int
    perPage:Int
    sortField: String,
    sortDirection: Int,
    searchValue: String,
    sortFromDate: String,
    sortToDate: String
`;

export const commonIndicatorTypes = `
    _id: String
    name: String!
    description: String
    tagIds: [String]
    operationIds: [String]
    branchIds:[String]
    departmentIds:[String]
    calculateMethod:String
    isWithDescription:Boolean
`;

export const commonRiskConformityTypes = `
    _id: String!,
    cardId: String!,
    riskIndicatorId: String!,
`;

export const commonRiskIndicatorFormParams = `
        _id:String,
        formId:String,
        calculateMethod:String,
        percentWeight:Int,
`;

export const commonRiskIndicatorParams = `
        _id:String,
        name: String
        description: String
        tagIds: [String]
        operationIds:[String]
        branchIds: [String]
        departmentIds: [String]
`;

export const commonCalculateLogicParams = `
        _id: String,
        name: String,
        value: Int
        value2:Int
        logic: String
        color: String
`;
