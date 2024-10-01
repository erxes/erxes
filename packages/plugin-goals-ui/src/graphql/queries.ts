import { isEnabled } from '@erxes/ui/src/utils/core';
const conformityQueryFields = `
  $mainType: String,
  $mainTypeId: String,
  $relType: String,
  $isRelated: Boolean,
  $isSaved: Boolean,
`;
export const companyFields = `
  _id
  createdAt
  modifiedAt
  avatar
  primaryName
  names
  size
  industry
  plan
  location

  parentCompanyId
  emails
  primaryEmail
  ownerId
  phones
  primaryPhone
  businessType
  description
  isSubscribed
  code
  links
  owner {
    _id
    details {
      fullName
    }
  }
  parentCompany {
    _id
    primaryName
  }

  customFieldsData
  trackedData
  tagIds
  ${
    isEnabled('tags')
      ? `
    getTags {
      _id
      name
      colorCode
    }
  `
      : ``
  }
  score
`;
const insuranceTypeFields = `
      _id
      name
      entity
      stageId
      pipelineId
      boardId
      contributionType
      metric
      goalTypeChoose
      contribution
      specificPeriodGoals
      segmentRadio
      stageRadio
      periodGoal
      pipelineLabels
      productIds
      companyIds
      tagsIds
      teamGoalType
      unit
      department
      branch
      teamGoalType
      startDate
      endDate
      segmentIds,
      segmentCount
`;

const listParamsDef = `
  $page: Int
  $perPage: Int
  $ids: [String]
  $date: Date
  $endDate: Date
  $branch: [String]
  $department: [String]
  $unit: [String]
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
  endDate:$endDate
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

const companies = `
  $page: Int
  $perPage: Int
  $segment: String
  $tag: String
  $ids: [String]
  $excludeIds: Boolean
  $searchValue: String
  $autoCompletion: Boolean
  $autoCompletionType: String
  $brand: String
  $sortField: String
  $sortDirection: Int
  $dateFilters: String
  $segmentData: String
  ${conformityQueryFields}
`;

const segmentFields = `
  _id
  name
  description
  subOf
  color
  conditions
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

const pipelineLabelFields = `
  _id
  name
  colorCode
  pipelineId
  createdBy
  createdAt
`;
const pipelineLabels = `
  query pipelineLabels($pipelineId: String!) {
    pipelineLabels(pipelineId: $pipelineId) {
      ${pipelineLabelFields}
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
  userDetail,
  companies,
  pipelineLabels
};
