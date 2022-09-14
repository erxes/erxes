export const commonPaginateDef = `
    $page:Int
    $perPage:Int
    $sortField: String,
    $sortDirection: Int,
    $searchValue: String,
    $sortFromDate:String
    $sortToDate:String
    $status:String
`;
export const commonPaginateValue = `
    page:$page
    perPage:$perPage
    sortField:$sortField,
    sortDirection:$sortDirection,
    searchValue:$searchValue,
    sortFromDate:$sortFromDate
    sortToDate:$sortToDate
    status:$status
`;

export const riskAssessmentDef = `
    $categoryId: String!,
    $description: String!,
    $name: String!,
    $calculateMethod: String!,
`;

export const riskAssessmentValues = `
    categoryId: $categoryId,
    description: $description,
    name: $name,
    calculateMethod: $calculateMethod
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
    statusColor,
    categoryId,
    createdAt,
    category{
        _id
        formId
        parentId
        name
    },
    calculateMethod,
    calculateLogics {
        _id
        logic
        name
        value
        value2
        color
      }
`;

export const riskConfirmityParams = `
    _id
    categoryId
    createdAt
    description
    name
    status
`;
