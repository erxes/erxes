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
    $withoutUserFilter: Boolean
  ) {
    departments(
      ids: $ids
      excludeIds: $excludeIds
      searchValue: $searchValue
      status: $status
      onlyFirstLevel: $onlyFirstLevel
      parentId: $parentId
      sortField: $sortField
      withoutUserFilter: $withoutUserFilter
    ) {
      _id
      code
      title
      supervisorId
      userCount
      order
      parentId
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
      status
    }
  }
`;

const GET_DEPARTMENT_MEMBERS = gql`
  query DepartmentMembers($id: String!) {
    departmentDetail(_id: $id) {
      _id
      title
      users {
        _id
        email
        isOnboarded
        details {
          fullName
          avatar
        }
      }
    }
  }
`;

export {
  GET_DEPARTMENTS_LIST,
  GET_DEPARTMENT_DETAIL_BY_ID,
  GET_DEPARTMENT_MEMBERS,
};
