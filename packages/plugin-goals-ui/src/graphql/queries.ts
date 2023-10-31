import { pipeline } from 'stream';

const insuranceTypeFields = `
  _id
      entity
      stageId
      pipelineId
      boardId
      contributionType
      frequency
      metric
      goalType
      contribution
      specificPeriodGoals
      progress
      startDate
      endDate
      target
`;

const listParamsDef = `
  $page: Int
  $perPage: Int
  $ids: [String]
  $date: String
  $branch: String
  $department: String
  $unit: String
  $contribution: [String]
  $searchValue: String
  $sortField: String
  $sortDirection: Int
`;

const listParamsValue = `
  page: $page
  perPage: $perPage
  ids: $ids
  date: $date
  branch: $branch
  department: $department
  contribution:$contribution
  unit: $unit
  searchValue: $searchValue
  sortField: $sortField
  sortDirection: $sortDirection
`;

export const goalTypes = `
  query goalTypes(${listParamsDef}) {
    goalTypes(${listParamsValue}) {
      ${insuranceTypeFields}
    }
  }
`;

export const goalTypesMain = `
  query goalTypesMain(${listParamsDef}) {
    goalTypesMain(${listParamsValue}) {
      list {
        ${insuranceTypeFields}
      }

      totalCount
    }
  }
`;

export const goalTypeCounts = `
  query goalTypeCounts(${listParamsDef}, $only: String) {
    goalTypeCounts(${listParamsValue}, only: $only)
  }
`;

export const goalTypeDetail = `
  query goalTypeDetail($_id: String!) {
    goalTypeDetail(_id: $_id) {
      ${insuranceTypeFields}
    }
  }
`;

const pipelineDetail = `
  query pipelineDetail($_id: String!) {
    pipelineDetail(_id: $_id) {
      _id
      name
    }
  }
`;
const boardDetail = `
  query boardDetail($_id: String!) {
    boardDetail(_id: $_id) {
      _id
      name
      pipelines {
        _id
        name
      }
    }
  }
`;
const stageDetail = `
   query stageDetail($_id:String!){
      stageDetail(_id: $_id) {
        _id
        name
      }
   }
`;
export const commonStructureParamsDef = `
    $ids: [String]
    $excludeIds: Boolean,
    $perPage: Int,
    $page: Int
    $searchValue: String,
    $status:String,
`;

export const commonStructureParamsValue = `
    ids: $ids
    excludeIds: $excludeIds,
    perPage: $perPage,
    page: $page
    searchValue: $searchValue
    status: $status
`;

export const branchField = `
  _id
  title
  address
  parentId
  supervisorId
  code
  order
  userIds
  userCount
  users {
    _id
    details {
      avatar
      fullName
    }
  }
  radius
`;

const nameFields = `
  firstName
  middleName
  lastName
`;
const detailFields = `
  avatar
  fullName
  shortName
  birthDate
  position
  workStartedDate
  location
  description
  operatorPhone
  ${nameFields}
`;

export const departmentField = `
  _id
  title
  description
  parentId
  code
  order
  supervisorId
  supervisor {
          _id
      username
      email
      status
      isActive
      groupIds
      brandIds
      score

      details {
        ${detailFields}
      }

      links
  }
  userIds
  userCount
  users {
    _id
    details {
      ${detailFields}
    }
  }
`;
export const unitField = `
  _id
  title
  description
  department
  department {
    ${departmentField}
  }
  supervisorId
  supervisor {
      _id
      username
      email
      status
      isActive
      groupIds
      brandIds
      score

      details {
        ${detailFields}
      }

      links
  }
  code
  userIds
  users {
    _id
    details {
      avatar
      fullName
    }
  }
`;
const branchesMain = `
  query branchesMain(${commonStructureParamsDef}, $withoutUserFilter: Boolean) {
    branchesMain (${commonStructureParamsValue}, withoutUserFilter: $withoutUserFilter){
      list {
        ${branchField}
        parent {${branchField}}
      }
      totalCount
      totalUsersCount
    }
  }
`;
const unitsMain = `
  query unitsMain(${commonStructureParamsDef}) {
    unitsMain(${commonStructureParamsValue}) {
      list {
        ${unitField}
      }
      totalCount
      totalUsersCount
    }
  }
`;
const departmentsMain = `
  query departmentsMain(${commonStructureParamsDef},$withoutUserFilter:Boolean) {
    departmentsMain(${commonStructureParamsValue},withoutUserFilter:$withoutUserFilter) {
      list {
        ${departmentField}
      }
      totalCount
      totalUsersCount
    }
  }
`;
const userDetail = `
  query userDetail($_id: String) {
    userDetail(_id: $_id) {
      _id
      username
      email
      isActive
      status
      groupIds
      branchIds
      departmentIds

      details {
        ${detailFields}
      }
      links
      emailSignatures
      getNotificationByEmail
      customFieldsData
      score
      employeeId
      brandIds
    }
  }
`;
export default {
  goalTypes,
  goalTypesMain,
  goalTypeCounts,
  goalTypeDetail,
  pipelineDetail,
  boardDetail,
  stageDetail,
  branchesMain,
  unitsMain,
  departmentsMain,
  userDetail
};
