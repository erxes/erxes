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
    categoryIds,
    departmentIds,
    branchIds,
    createdAt,
    categories{
        _id
        formId
        parentId
        name
    },
      forms {
        _id
        calculateMethod
        formId
        percentWeight
        calculateLogics {
          _id
          color
          logic
          name
          value
          value2
        }
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
