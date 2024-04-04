export const movementParams = `
    _id:String,
    branches:[String],
    departments:[String],
    customers:[String],
    teamMember:[String],
    company:[String],
`;

export const movementFilters = `
    movementId:String,
    branchId:String,
    departmentId:String,
    customerId:String,
    companyId:String,
    teamMemberId:String,
    assetId:String,
    parentId:String,
    assetIds:[String]
    movedAtFrom:String,
    movedAtTo:String,
    modifiedAtFrom:String,
    modifiedAtTo:String,
    createdAtFrom:String,
    createdAtTo:String,
    searchValue:String,
    userId:String,
    withKnowledgebase:Boolean,
    onlyCurrent:Boolean,
`;

export const commonFilterParams = `
    perPage:Int,
    page:Int,
`;
