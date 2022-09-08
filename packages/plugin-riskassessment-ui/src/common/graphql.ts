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
`;

export const riskAssessmentValues = `
    categoryId: $categoryId,
    description: $description,
    name: $name,
`;

export const riskAssessmentCategoryParams = `
_id
formId
parentId
name
code
order
`;

export const riskAssessmentParams = ({ status }) => `
    _id,
    name,
    description,
    ${status ? 'status' : ''}
    categoryId,
    createdAt,
    category{
        _id
        formId
        parentId
        name
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
