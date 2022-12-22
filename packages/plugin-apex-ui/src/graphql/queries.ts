const reports = `
  query apexReports($page: Int, $perPage: Int) {
    apexReports(page: $page, perPage: $perPage) {
      _id
      name
      code
      createdAt
    }
  }
`;

const reportsDetail = `
  query apexReportDetail($_id: String!) {
    apexReportDetail(_id: $_id) {
      _id
      name
      code
      content
      companyId
      company {
        _id
        primaryName
      }
    }
  }
`;

const companies = `
  query companies {
    companies {
      _id
      primaryName
    }
  }
`;

export default {
  reports,
  companies,
  reportsDetail
};
