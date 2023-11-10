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
$tagId: String
`;

const commonParamsDef = `
searchValue: $searchValue
perPage: $perPage
page: $page
departmentId: $departmentId
tagId: $tagId
`;

const reportsList = `
  query reportsList(${commonParams}) {
    reportsList(${commonParamsDef}) {
      list {
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
        members {
          ${userFields}
        }
        charts {
          name
          contentType
          templateType
          order
          chartType
          filters {
            fieldName
            filterValue
            filterType
          }
          defaultFilter {
            fieldName
            filterValue
            filterType
          }
        }
        tags{
          _id
          name
          colorCode
        }
      }

      totalCount
    }
  }
`;

const totalCount = `
  query reportssTotalCount{
    reportssTotalCount
  }
`;

const reportTemplatesList = `
  query reportTemplatesList($searchValue: String) {
    reportTemplatesList(searchValue: $searchValue) {
      title
      type
      description
      charts
      img
      serviceName
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
          name
          contentType
          templateType
          order
          chartType
          filters {
            fieldName
            filterValue
            filterType
          }
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

export default {
  reportsList,
  totalCount,

  reportTemplatesList,
  reportChartTemplatesList,
  reportDetail,
  reportsCountByTags
};
