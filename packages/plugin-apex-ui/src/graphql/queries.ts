const reports = `
  query apexReports($page: Int, $perPage: Int) {
    apexReports(page: $page, perPage: $perPage) {
      _id
      type
      name
      code
      createdAt
      company {
        primaryName
      }
    }
  }
`;

const reportsDetail = `
  query apexReportDetail($_id: String!) {
    apexReportDetail(_id: $_id) {
      _id
      type
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
  query companies($perPage: Int) {
    companies(perPage: $perPage) {
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
