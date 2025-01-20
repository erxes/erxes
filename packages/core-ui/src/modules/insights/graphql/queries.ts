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
        createdBy {
          ${userFields}
        }
        updatedAt
        updatedBy {
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
        isPinned
        tags {
          _id
          name
          colorCode
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
        isPinned
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

const insightPinnedList = `
  query insightPinnedList {
    insightPinnedList {
      _id
      name
      type
      sectionId
      chartsCount
      isPinned
    }
  }
`;

const chartGetResult = `
  query chartGetResult($serviceName: String!, $templateType: String!, $chartType: String!, $filter: JSON, $dimension: JSON){
    chartGetResult(serviceName: $serviceName, templateType: $templateType,  chartType: $chartType, filter: $filter , dimension: $dimension)
  }
`;

const insightServicesList = `
  query insightServicesList{
    insightServicesList
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
        isPinned
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
      isPinned
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

export default {
  insightGetLast,
  insightTemplatesList,
  insightChartTemplatesList,
  insightServicesList,
  insightPinnedList,
  chartGetResult,

  //dashboard
  dashboardList,
  dashboardDetail,

  //section
  sectionList,

  //report
  reportList,
  reportDetail,
};
