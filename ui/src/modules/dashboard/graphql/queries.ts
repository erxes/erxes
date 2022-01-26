const dashboardItemDetail = `
  query dashboardItemDetail($_id: String!) {
    dashboardItemDetail(_id: $_id) {
      _id
      layout
      vizState
      name
      parentId
      order
      createdAt
      relatedIds
    }
  }
`;

const dashboards = `
  query dashboards($page: Int, $perPage: Int) {
    dashboards(page: $page, perPage: $perPage) {
	    _id
	    name
      description
      visibility
      selectedMemberIds
      parentId
      order
      createdAt
      relatedIds
	  }
  }
`;

const dashboardDetails = `
  query dashboardDetails($_id: String!) {
    dashboardDetails(_id: $_id) {
	    _id
	    name
      description
      visibility
      selectedMemberIds
      parentId
      order
      createdAt
      relatedIds
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
  totalCount,
  dashboards,
  dashboardDetails
};
