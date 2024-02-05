import { isEnabled } from '@erxes/ui/src/utils/core';
const tagsAvailable = isEnabled('tags') ? true : false;

const userFields = `
  _id
  username
  email
  employeeId
  details {
    avatar
    fullName
    firstName
    lastName
    position
  }
  departments {
    title
  }
  branches {
    title
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

const reportsList = `
  query reportsList(${commonParams}) {
    reportsList(${commonParamsDef}) {
      list {
        _id
        name
        visibility
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
          tagsAvailable
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

const reportDetail = `
  query reportDetail($reportId: String!) {
    reportDetail(reportId: $reportId) {
      _id
        name
        visibility
        createdAt
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
          tagsAvailable
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

const reportsCountByTags = `
query reportsCountByTags {
  reportsCountByTags
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
}`;

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
    }
  }
`;

const tags = `  
  query tags($type: String, $perPage:Int ) {
    tags(type: $type, perPage: $perPage) {
      _id
      name
      colorCode
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

const goalsList = `
  query goalTypesMain {
    goalTypesMain {
      list {
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
      }
    }
  }
`;

const goalDetail = `
  query goalDetail($id: String!) {
    goalDetail(_id: $id)
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

export default {
  reportsList,
  allBrands,
  integrations,
  reportTemplatesList,
  reportChartTemplatesList,
  reportDetail,
  reportsCountByTags,

  reportChartGetResult,
  reportServicesList,
  tags,
  boards,
  pipelines,

  goalsList,

  goalDetail,
  pipelineDetail,
  boardDetail,
  stageDetail,
  userDetail,

  branchesMain,
  unitsMain,
  departmentsMain,
};
