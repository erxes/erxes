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
    }
  }
`;

export default {
  reports,
  reportsDetail
};
