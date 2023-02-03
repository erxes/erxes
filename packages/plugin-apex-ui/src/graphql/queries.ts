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

const stories = `
  query apexStories($page: Int, $perPage: Int) {
    apexStories(page: $page, perPage: $perPage) {
      _id
      title
      createdAt
      company {
        primaryName
      }
    }
  }
`;

const storiesDetail = `
  query apexStoryDetail($_id: String!) {
    apexStoryDetail(_id: $_id) {
      _id
      title
      content
      companyId
      company {
        _id
        primaryName
      }
    }
  }
`;

export default {
  reports,
  companies,
  reportsDetail,
  stories,
  storiesDetail
};
