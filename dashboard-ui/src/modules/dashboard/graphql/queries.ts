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
      isDateRange
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

const dashboardInitialDatas = `
  query dashboardInitialDatas($type: String) {
    dashboardInitialDatas(type: $type){
      vizState
      name
      type
    }
  }
`;

const totalCount = `
  query dashboardsTotalCount {
	  dashboardsTotalCount
  }
`;

const dashboardFilters = `
  query dashboardFilters($type: String) {
    dashboardFilters(type: $type)
  }
`;

export default {
  dashboardItemDetail,
  dashboardItems,
  totalCount,
  dashboards,
  dashboardInitialDatas,
  dashboardFilters
};
