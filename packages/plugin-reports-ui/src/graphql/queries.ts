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
        tags  {
          _id
          name
          colorCode
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

        tags  {
          _id
          name
          colorCode
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
const stages = `
  query stages($pipelineId: String!, $isAll: Boolean) {
    stages(pipelineId: $pipelineId, isAll: $isAll) {
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
  query pipelineLabels($pipelineId: String!) {
    pipelineLabels(pipelineId: $pipelineId) {
      ${pipelineLabelFields}
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
  pipelineLabels,
  stages,
  fieldsGroups
};
