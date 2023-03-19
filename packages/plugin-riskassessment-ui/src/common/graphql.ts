import { isEnabled } from '@erxes/ui/src/utils/core';

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

export const riskIndicatorParams = `
    _id,
    name,
    description,
    operationIds
    departmentIds,
    branchIds,
    createdAt,
    isWithDescription
    ${isEnabled('tags') ? `tags{_id,name,colorCode}` : ''}
    
    tagIds
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

export const tags = `
  query tagsQuery($type: String, $tagIds: [String], $parentId: String) {
    tags(type: $type, tagIds: $tagIds, parentId: $parentId) {
      _id
      name
      type
      colorCode
      createdAt
      objectCount
      totalObjectCount
      parentId
      order
      relatedIds
    }
  }
`;
