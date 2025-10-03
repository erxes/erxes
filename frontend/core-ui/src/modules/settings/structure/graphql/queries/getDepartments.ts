import { gql } from '@apollo/client';

const GET_DEPARTMENTS_LIST = gql`
  query Departments(
    $ids: [String]
    $excludeIds: Boolean
    $searchValue: String
    $status: String
    $onlyFirstLevel: Boolean
    $parentId: String
    $sortField: String
    $limit: Int
    $cursor: String
    $direction: CURSOR_DIRECTION
    $withoutUserFilter: Boolean
  ) {
    departmentsMain(
      ids: $ids
      excludeIds: $excludeIds
      searchValue: $searchValue
      status: $status
      onlyFirstLevel: $onlyFirstLevel
      parentId: $parentId
      sortField: $sortField
      limit: $limit
      cursor: $cursor
      direction: $direction
      withoutUserFilter: $withoutUserFilter
    ) {
      list {
        _id
        code
        title
        supervisorId
        userCount
        order
        parentId
      }
      pageInfo {
        endCursor
        hasNextPage
        hasPreviousPage
        startCursor
      }
      totalCount
    }
  }
`;

const GET_DEPARTMENT_DETAIL_BY_ID = gql`
  query DepartmentDetail($id: String!) {
    departmentDetail(_id: $id) {
      _id
      code
      description
      parentId
      supervisorId
      title
      userIds
      userCount
    }
  }
`;

export { GET_DEPARTMENTS_LIST, GET_DEPARTMENT_DETAIL_BY_ID };
