export const commonPaginateDef = `
    $page:Int
    $perPage:Int
    $sortField: String,
    $sortDirection: Int,
    $searchValue: String,
    $sortFromDate:String
    $sortToDate:String
`;
export const commonPaginateValue = `
    page:$page
    perPage:$perPage
    sortField:$sortField,
    sortDirection:$sortDirection,
    searchValue:$searchValue,
    sortFromDate:$sortFromDate
    sortToDate:$sortToDate
`;

export const riskAssessmentDef = `
    $categoryId: String!,
    $description: String!,
    $name: String!,
    $status: String!
`;

export const riskAssessmentValues = `
    categoryId: $categoryId,
    description: $description,
    name: $name,
    status: $status
`;

export const riskAssessmentCategoryParams = `
_id
formId
parentId
name
code
order
`;

export const riskAssessmentParams = `
    _id,
    name,
    description,
    status,
    categoryId,
    createdAt,
    category{
        _id
        formId
        parentId
        name
    }
`;
