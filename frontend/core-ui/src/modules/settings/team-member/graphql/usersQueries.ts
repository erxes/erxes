import { gql } from '@apollo/client';
import {
  GQL_CURSOR_PARAM_DEFS,
  GQL_CURSOR_PARAMS,
  GQL_PAGE_INFO,
} from 'erxes-ui';

const GET_USER = gql`
  query UserDetail($_id: String) {
    userDetail(_id: $_id) {
      _id
      username
      email
      positionIds
      details {
        avatar
        shortName
        birthDate
        workStartedDate
        location
        description
        firstName
        middleName
        lastName
        operatorPhone
      }
      links
      employeeId
      branchIds
      departmentIds
      isSubscribed
    }
  }
`;

const GET_USERS_QUERY = gql`
  query Users(
    ${GQL_CURSOR_PARAM_DEFS}
    $status: String
    $excludeIds: Boolean
    $searchValue: String
    $brandIds: [String]
    $departmentId: String
    $branchId: String
    $branchIds: [String]
    $departmentIds: [String]
    $unitId: String
    $segment: String
    $isActive: Boolean
  ) {
    users(
      ${GQL_CURSOR_PARAMS}
      status: $status
      excludeIds: $excludeIds
      searchValue: $searchValue
      brandIds: $brandIds
      departmentId: $departmentId
      branchId: $branchId
      branchIds: $branchIds
      departmentIds: $departmentIds
      unitId: $unitId
      segment: $segment
      isActive: $isActive
    ) {
      list {
        _id
        username
        email
        status
        isActive
        groupIds
        brandIds
        score
        positionIds
        role
        details {
          avatar
          shortName
          birthDate
          workStartedDate
          location
          description
          firstName
          middleName
          lastName
          operatorPhone
        }
        links
        employeeId
      }
      ${GQL_PAGE_INFO}
    }
  }
`;

const GET_USERS_GROUPS_QUERY = gql`
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

const GET_BRANCHES_QUERY = gql`
  query branches($withoutUserFilter: Boolean) {
    branches(withoutUserFilter: $withoutUserFilter) {
      list {
        _id
        title
        code
        parentId
        userCount
      }
      ${GQL_PAGE_INFO}
    }
  }
`;

const GET_DEPARTMENTS_QUERY = gql`
  query departments($withoutUserFilter: Boolean) {
    departments(withoutUserFilter: $withoutUserFilter) {
      list {
        _id
        title
        code
        parentId
      }
      ${GQL_PAGE_INFO}
    }
  }
`;

const GET_UNITS_QUERY = gql`
  query units {
    units {
      list {
        _id
        title
        code
        userCount
      }
      ${GQL_PAGE_INFO}
    }
  }
`;

const GET_SEGMENTS_QUERY = gql`
  query segments($contentTypes: [String]!, $config: JSON) {
    segments(contentTypes: $contentTypes, config: $config) {
      _id
      contentType
      name
      description
      subOf
      color
      conditions
      conditionsConjunction
      shouldWriteActivityLog
      config
      getSubSegments {
        _id
        contentType
        name
        description
        subOf
        color
        conditions
        conditionsConjunction
        shouldWriteActivityLog
        config
      }
    }
  }
`;

const GET_USER_COUNT_BY_OPTION_QUERY = gql`
  query usersTotalCount(
    $departmentId: String
    $unitId: String
    $branchId: String
    $departmentIds: [String]
    $branchIds: [String]
  ) {
    usersTotalCount(
      departmentId: $departmentId
      unitId: $unitId
      branchId: $branchId
      departmentIds: $departmentIds
      branchIds: $branchIds
    )
  }
`;

const queries = {
  GET_BRANCHES_QUERY,
  GET_DEPARTMENTS_QUERY,
  GET_UNITS_QUERY,
  GET_USERS_GROUPS_QUERY,
  GET_USERS_QUERY,
  GET_SEGMENTS_QUERY,
  GET_USER_COUNT_BY_OPTION_QUERY,
  GET_USER,
};

export default queries;
