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

export const riskIndicatorDef = `
    $categoryIds: String,
    $description: String,
    $name: String!,
    $calculateMethod: String,
`;

export const riskIndicatorValues = `
    categoryIds: $categoryIds,
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
type
`;

export const riskIndicatorParams = `
    _id,
    name,
    description,
    categoryId,
    operationIds
    departmentIds,
    branchIds,
    createdAt,
    customScoreField {
        label,
        percentWeight
    }
    category{
        _id
        formId
        parentId
        name
    },
      forms {
        _id
        calculateMethod
        calculateLogics {
            _id
            name
            value
            logic
            color
        }
        formId
        percentWeight
      }
`;

export const riskConformityParams = `
    _id
    categoryId
    createdAt
    description
    name
    status
`;
