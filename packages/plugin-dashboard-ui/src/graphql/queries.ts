const listParamsDef = `
  $page: Int
  $perPage: Int
  $ids: [String]
  $excludeIds: Boolean
  $searchValue: String
  $sortField: String
  $sortDirection: Int
  $status: String
`;

const listParamsValue = `
  page: $page
  perPage: $perPage
  ids: $ids
  excludeIds: $excludeIds
  searchValue: $searchValue
  sortField: $sortField
  sortDirection: $sortDirection
  status: $status
`;

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
  query dashboards(${listParamsDef}) {
    dashboards(${listParamsDef}) {
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

export const dashboardsMain = `
  query dashboardsMain(${listParamsDef}) {
    dashboardsMain(${listParamsValue}) {
      list {
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

      totalCount
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
  dashboardsMain,
  dashboardItemDetail,
  totalCount,
  dashboards,
  dashboardDetails
};
