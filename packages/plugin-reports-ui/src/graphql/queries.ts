const reportsList = `
  query reportsList {
    reportsList {
      list {
        _id
        name
        visibility
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
