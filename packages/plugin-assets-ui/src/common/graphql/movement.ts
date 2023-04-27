export const movementParamsDef = `
    $assetId:String,
    $assetName:String,
    $branchId:String,
    $departmentId:String,
    $customerId:String,
    $teamMemberId:String,
    $companyId:String,
`;

export const movementParams = `
    assetId:$assetId,
    assetName:$assetName,
    branchId:$branchId
    departmentId:$departmentId
    customerId:$customerId
    teamMemberId:$teamMemberId
    companyId:$companyId
`;

export const movementFilterParams = `
    $branchId:String,
    $departmentId:String,
    $customerId:String,
    $teamMemberId:String,
    $companyId:String,
    $assetId:String,
    $parentId:String,
    $assetIds:[String],
    $searchValue:String
    $onlyCurrent:Boolean
`;

export const movementFilterParamsDef = `
    branchId:$branchId
    departmentId:$departmentId
    customerId:$customerId
    teamMemberId:$teamMemberId
    companyId:$companyId
    assetId:$assetId
    parentId:$parentId
    assetIds:$assetIds
    searchValue:$searchValue
    onlyCurrent:$onlyCurrent
`;

export const dateFilterParams = `
    $movedAtFrom :String,
    $movedAtTo :String,
    $modifiedAtFrom :String,
    $modifiedAtTo :String,
    $createdAtFrom :String,
    $createdAtTo :String
`;
export const dateFilterParamsDef = `
    movedAtFrom : $movedAtFrom,
    movedAtTo: $movedAtTo,
    modifiedAtFrom : $modifiedAtFrom,
    modifiedAtTo: $modifiedAtTo,
    createdAtFrom : $createdAtFrom,
    createdAtTo: $createdAtTo
`;

export const commonFilterParams = `
    $perPage: Int,
    $page: Int 
`;
export const commonFilterParamsDef = `
    perPage:$perPage,
    page:$page
`;
