const dashboardItems = `
  query dashboardItems($dashboardId: String!) {
    dashboardItems(dashboardId: $dashboardId) {
      _id
      layout
      vizState
      name
    }
  }
`;

const dashboardItemDetail = `
  query dashboardItemDetail($_id: String!) {
    dashboardItemDetail(_id: $_id) {
      _id
      layout
      vizState
      name
      type
    }
  }
`;

const dashboards = `
  query dashboards($page: Int, $perPage: Int) {
    dashboards(page: $page, perPage: $perPage) {
	    _id
	    name
	  }
  }
`;

const totalCount = `
  query dashboardsTotalCount {
	  dashboardsTotalCount
  }
`;

export default {
  dashboardItemDetail,
  dashboardItems,
  totalCount,
  dashboards
};
