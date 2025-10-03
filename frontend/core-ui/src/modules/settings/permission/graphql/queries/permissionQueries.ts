import { gql } from '@apollo/client';

const GET_USERS = gql`
  query users(
    $page: Int
    $perPage: Int
    $status: String
    $excludeIds: Boolean
    $searchValue: String
    $isActive: Boolean
    $ids: [String]
    $brandIds: [String]
    $departmentId: String
    $unitId: String
    $isAssignee: Boolean
    $branchId: String
    $departmentIds: [String]
    $branchIds: [String]
    $segment: String
    $segmentData: String
  ) {
    users(
      page: $page
      perPage: $perPage
      status: $status
      excludeIds: $excludeIds
      searchValue: $searchValue
      isActive: $isActive
      ids: $ids
      brandIds: $brandIds
      departmentId: $departmentId
      unitId: $unitId
      branchId: $branchId
      isAssignee: $isAssignee
      departmentIds: $departmentIds
      branchIds: $branchIds
      segment: $segment
      segmentData: $segmentData
    ) {
      _id
      username
      email
      status
      isActive
      groupIds
      brandIds
      score
      positionIds
      details {
        avatar
        fullName
        shortName
        birthDate
        position
        workStartedDate
        location
        description
        operatorPhone
        firstName
        middleName
        lastName
      }
      links
      employeeId
    }
  }
`;

const GET_USERS_GROUP = gql`
  query usersGroups($page: Int, $perPage: Int) {
    usersGroups(page: $page, perPage: $perPage) {
      _id
      name
      description
      memberIds
      members {
        _id
        isActive
        details {
          fullName
          avatar
        }
      }
      departmentIds
      branchIds
    }
  }
`;

const GET_PERMISSIONS = gql`
  query permissions(
    $module: String
    $action: String
    $userId: String
    $groupId: String
    $allowed: Boolean
    $page: Int
    $perPage: Int
  ) {
    permissions(
      module: $module
      action: $action
      userId: $userId
      groupId: $groupId
      allowed: $allowed
      page: $page
      perPage: $perPage
    ) {
      _id
      module
      action
      userId
      groupId
      allowed
      user {
        _id
        username
        email
      }
      group {
        _id
        name
      }
    }
    permissionsTotalCount(
      module: $module
      action: $action
      userId: $userId
      groupId: $groupId
      allowed: $allowed
    )
  }
`;

const GET_PERMISSION_ACTIONS = gql`
  query permissionActions {
    permissionActions {
      name
      description
      module
    }
  }
`;

const GET_PERMISSION_MODULES = gql`
  query permissionModules {
    permissionModules {
      name
      description
    }
  }
`;

const queries = {
  GET_USERS,
  GET_PERMISSIONS,
  GET_USERS_GROUP,
  GET_PERMISSION_ACTIONS,
  GET_PERMISSION_MODULES,
};

export default queries;
