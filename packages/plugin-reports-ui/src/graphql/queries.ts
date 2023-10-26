const reportsList = `
  query reportsList {
    reportsList {
      list {
        _id
        name
        description
        visibility
        charts {
          _id
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

export default {
  reportsList,
  totalCount
};
