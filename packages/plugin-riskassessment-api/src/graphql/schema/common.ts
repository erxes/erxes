export const commonTypes = `
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

export const commonRiskIndicatorTypes = `
    _id: String
    name: String!
    description: String
    categoryId: String
    operationIds: [String]
    branchIds:[String]
    departmentIds:[String]
    calculateMethod:String
    customScoreField: JSON
`;

export const commonRiskConformityTypes = `
    _id: String!,
    cardId: String!,
    riskIndicatorId: String!,
`;

export const commonAssessmentCategoryTypes = `
    _id: String
    name: String
    formId: String
    parentId: String
`;

export const commonFormSubmissionsTypes = `
    cardId: String,
    cardType: String,
    riskAssessmentId: String,
    userId: String,
    fieldId: String,
    indicatorId: String,
    customScore:Int,
    formSubmissions:JSON
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
        categoryId: String
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
