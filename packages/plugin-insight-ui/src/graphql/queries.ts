import { isEnabled } from '@erxes/ui/src/utils/core';

// Fields

const pipelineLabelFields = `
  _id
  name
  colorCode
  pipelineId
  createdBy
  createdAt
`;

const genericFields = `
  _id
  description
  code
  order
  isVisible
  isVisibleInDetail
  contentType
  isDefinedByErxes
`;

const commonFields = `
  type
  text

  logicAction
  logics {
    fieldId
    logicOperator
    logicValue
  }
  canHide
  validation
  options
  isVisibleToCreate
  locationOptions{
    lat
    lng
    description
  }
  objectListConfigs{
    key
    label
    type
  }
  groupId
  searchable
  showInCard
  isRequired

  ${genericFields}

  lastUpdatedUser {
    details {
      fullName
    }
  }
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
  query reportList(${commonParams}) {
    reportList(${commonParamsDef}) {
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

const insightTemplatesList = `
  query insightTemplatesList($searchValue: String, $serviceName: String) {
    insightTemplatesList(searchValue: $searchValue, serviceName: $serviceName) {
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

const insightChartTemplatesList = `
  query insightChartTemplatesList($serviceName: String!, $charts: [String]) {
    insightChartTemplatesList(serviceName: $serviceName, charts: $charts)
  }
`;

const chartGetResult = `
  query chartGetResult($serviceName: String!, $templateType: String!, $filter: JSON, $dimension: JSON){
    chartGetResult(serviceName: $serviceName, templateType: $templateType, filter: $filter , dimension: $dimension)
  }
`;

const insightServicesList = `
  query insightServicesList{
    insightServicesList
  }
`;

const allBrands = `
  query allBrands{
    allBrands{
      _id
      name
    }
  }
`;

const integrations = `
  query integrations($kind: String, $brandId: String) {
    integrations(kind: $kind, brandId: $brandId) {
      _id
      name
      form {
        _id
        title
      }
    }
  }
`;

const channels = `
    query channels {
        channels {
            _id
            name
        }
    }
`;

const tags = `  
  query tags($type: String, $perPage:Int ) {
    tags(type: $type, perPage: $perPage) {
      _id
      name
      parentId
      colorCode
      type
    }
  }
`;

const boards = `
  query boards($type: String!) {
    boards(type: $type) {
      _id
      name

      pipelines {
        _id
        name
      }
    }
  }
`;
const stages = `
  query stages($pipelineId: String, $isAll: Boolean, $pipelineIds: [String]) {
    stages(pipelineId: $pipelineId, isAll: $isAll, pipelineIds: $pipelineIds) {
      _id
      name
      probability
      visibility
      memberIds
      canMoveMemberIds
      canEditMemberIds
      departmentIds
      pipelineId
      formId
      status
      code
      age
      defaultTick
    }
  }
`;
const pipelines = `
  query pipelines($boardId: String, $type: String, $perPage: Int, $page: Int, $isAll: Boolean) {
    pipelines(boardId: $boardId, type: $type, perPage: $perPage, page: $page, isAll: $isAll) {
      _id
      name
      boardId
      state
      startDate
      endDate
      itemsTotalCount
    }
  }
`;

const pipelineLabels = `
  query pipelineLabels($pipelineId: String, $pipelineIds: [String]) {
    pipelineLabels(pipelineId: $pipelineId, pipelineIds: $pipelineIds) {
      ${pipelineLabelFields}
    }
  }
`;

const fields = `
  query fields($contentType: String!, $groupIds: [String]) {
    fields(contentType: $contentType, groupIds: $groupIds) {
      _id
      text
      groupId
    }
  }
`;

const fieldsGroups = `
  query fieldsGroups($contentType: String!, $isDefinedByErxes: Boolean, $config: JSON) {
    fieldsGroups(contentType: $contentType, isDefinedByErxes: $isDefinedByErxes, config: $config) {
      name
      ${genericFields}
      isMultiple
      parentId
      config
      logicAction
      logics {
        fieldId
        logicOperator
        logicValue
      }
      lastUpdatedUser {
        details {
          fullName
        }
      }
      fields  {
        ${commonFields}
      }
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
  query dashboardList {
    dashboardList {
      list {
        _id
        name
        sectionId
        chartsCount
      }
      totalCount
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

const insightGetLast = `
  query insightGetLast {
    insightGetLast
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
const fieldsGetTypes = `
  query fieldsGetTypes {
    fieldsGetTypes
  }
`;

const tagsGetTypes = `
  query tagsGetTypes {
    tagsGetTypes
  }
`;
const assets = `
  query assets($searchValue: String) {
    assets(searchValue: $searchValue) {
      _id,
      name,
      code,
      order
    }
  }
`;

export default {
  insightGetLast,
  insightTemplatesList,
  insightChartTemplatesList,
  insightServicesList,
  chartGetResult,

  //dashboard
  dashboardList,
  dashboardDetail,

  //section
  sectionList,

  //goal
  goalTypesMain,
  goalTypesDetail,

  //report
  reportList,
  reportDetail,

  // related

  allBrands,
  integrations,

  tags,
  channels,
  assets,
  boards,
  stages,
  pipelines,
  pipelineLabels,

  fields,
  fieldsGroups,

  pipelineDetail,
  boardDetail,
  stageDetail,
  userDetail,

  branchesMain,
  unitsMain,
  departmentsMain,
  fieldsGetTypes,
  tagsGetTypes,
};
