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

`;

const commonParamsDef = `
searchValue: $searchValue
`;

const reportsList = `
  query reportsList(${commonParams}) {
    reportsList(${commonParamsDef}}) {
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
        charts {
          name
          contentType
          template
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

export default {
  reportsList,
  totalCount,
  reportTemplatesList,
  reportChartTemplatesList
};
