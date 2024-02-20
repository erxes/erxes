import { isEnabled } from '@erxes/ui/src/utils/core';

// Fields

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

const userFields = `
  _id
  username
  email
  employeeId
  details {
    ${detailFields}
  }
  departments {
    title
  }
  branches {
    title
  }
`;

const branchField = `
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

const departmentField = `
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

const unitField = `
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

// Goal Queries

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

const insuranceTypeFields = `
  _id
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
  unit
  department
  branch
  teamGoalType
  progress
  startDate
  endDate
  target
  segmentIds,
  segmentCount
`;

const goalTypesMain = `
  query goalTypesMain(${listParamsDef}) {
    goalTypesMain(${listParamsValue}) {
      list {
        ${insuranceTypeFields}
      }

      totalCount
    }
  }
`;

const goalTypesDetail = `
  query goalDetail($id: String!) {
    goalDetail(_id: $id)
  }
`;

// Report Queries

const commonParams = `
$searchValue: String
$perPage: Int
$page: Int
$departmentId: String
$tag: String
`;

const commonParamsDef = `
searchValue: $searchValue
perPage: $perPage
page: $page
departmentId: $departmentId
tag: $tag
`;

const reportList = `
  query reportsList(${commonParams}) {
    reportsList(${commonParamsDef}) {
      list {
        _id
        name
        sectionId
        visibility
        serviceName
        serviceType
        chartsCount
        createdAt
        createdBy{
          ${userFields}
        }
        updatedAt
        updatedBy{
          ${userFields}
        }
        members {
          ${userFields}
        }
        charts {
          _id
          name
          contentType
          templateType
          layout
          vizState
          order
          chartType
          filter
          dimension
          defaultFilter {
            fieldName
            filterValue
            filterType
          }
        }
        ${
          isEnabled('tags')
            ? `tags  {
            _id
            name
            colorCode
          }`
            : ``
        }
      }

      totalCount
    }
  }
`;

const reportDetail = `
  query reportDetail($reportId: String!) {
    reportDetail(reportId: $reportId) {
      _id
        name
        sectionId
        visibility
        createdAt
        serviceName
        serviceType
        createdBy{
          ${userFields}
        }
        updatedAt
        updatedBy{
          ${userFields}
        }
        members{
          ${userFields}
        }
        charts {
          _id
          name
          contentType
          templateType
          serviceName
          order
          chartType
          layout
          vizState
          filter
          dimension
          defaultFilter {
            fieldName
            filterValue
            filterType
          }
        }

        ${
          isEnabled('tags')
            ? `tags  {
            _id
            name
            colorCode
          }`
            : ``
        }

        assignedDepartmentIds
        assignedUserIds
    }
  }
`;

const reportTemplatesList = `
  query reportTemplatesList($searchValue: String, $serviceName: String) {
    reportTemplatesList(searchValue: $searchValue, serviceName: $serviceName) {
      title
      type
      description
      charts
      img
      serviceName
      serviceType
    }
  }
`;

const reportChartTemplatesList = `
  query reportChartTemplatesList($serviceName: String!, $charts: [String]) {
    reportChartTemplatesList(serviceName: $serviceName, charts: $charts)
  }
`;

const reportChartGetResult = `
  query reportChartGetResult($serviceName: String!, $templateType: String!, $filter: JSON, $dimension: JSON){
    reportChartGetResult(serviceName: $serviceName, templateType: $templateType, filter: $filter , dimension: $dimension)
  }
`;

const reportServicesList = `
  query reportServicesList{
    reportServicesList
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
        firstName
        middleName
        lastName
        avatar
        fullName
        shortName
        position
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

const branchesMain = `
  query branchesMain($withoutUserFilter: Boolean) {
    branchesMain (withoutUserFilter: $withoutUserFilter){
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
  query unitsMain {
    unitsMain {
      list {
        ${unitField}
      }
      totalCount
      totalUsersCount
    }
  }
`;

const departmentsMain = `
  query departmentsMain($withoutUserFilter:Boolean) {
    departmentsMain(withoutUserFilter:$withoutUserFilter) {
      list {
        ${departmentField}
      }
      totalCount
      totalUsersCount
    }
  }
`;

const dashboardList = `
  query dashboards {
    dashboards {
      _id
      name
      sectionId
      chartsCount
    }
  }
`;

const dashboardDetail = `
  query dashboardDetail($id: String!) {
    dashboardDetail(_id: $id) {
      _id
      name
      sectionId
      visibility
      serviceTypes
      serviceNames
      assignedUserIds
      assignedDepartmentIds
      members {
        ${userFields}
      }
      charts {
        _id
        name
        contentType
        templateType
        serviceName
        order
        chartType
        layout
        vizState
        filter
        dimension
        defaultFilter {
          fieldName
          filterValue
          filterType
        }
      }
      chartsCount
    }
  }
`;

const sectionList = `
  query sections($type: String) {
    sections(type: $type) {
      _id
      name
      type
      list
      listCount
    }
  }
`;

export default {
  dashboardList,
  dashboardDetail,

  sectionList,

  goalTypesMain,
  goalTypesDetail,

  reportList,
  reportDetail,

  reportTemplatesList,
  reportChartTemplatesList,

  reportChartGetResult,
  reportServicesList,

  pipelineDetail,
  boardDetail,
  stageDetail,
  userDetail,

  branchesMain,
  unitsMain,
  departmentsMain,
};
