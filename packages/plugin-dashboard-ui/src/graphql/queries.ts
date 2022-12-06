import { isEnabled } from '@erxes/ui/src/utils/core';

const userFields = `
  _id
  username
  email
  details {
    avatar
    fullName
  }
`;

const listParamsDef = `
  $page: Int
  $perPage: Int
  $tag: String
  $departmentId: String
  $ids: [String]
  $excludeIds: Boolean
  $searchValue: String
  $sortField: String
  $sortDirection: Int
`;

const listParamsValue = `
  page: $page
  perPage: $perPage
  tag: $tag
  departmentId: $departmentId
  ids: $ids
  excludeIds: $excludeIds
  searchValue: $searchValue
  sortField: $sortField
  sortDirection: $sortDirection
`;

const dashboardCountByTags = `
  query dashboardCountByTags{ 
    dashboardCountByTags
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
      departmentIds
      parentId
      order
      createdAt
      relatedIds
      createdAt
      updatedAt
      createdBy
      updatedBy
      createdUser {
        ${userFields}
      }
      updatedUser {
        ${userFields}
      }
      members {
        ${userFields}
      }
      itemsCount
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
        departmentIds
        parentId
        order
        createdAt
        updatedAt
        relatedIds
        itemsCount
        ${
          isEnabled('tags')
            ? `
          getTags {
            _id
            name
            colorCode
          }
          `
            : ``
        }
        tagIds
        createdUser {
          ${userFields}
        }

        updatedUser {
          ${userFields}
        }
        members {
          ${userFields}
        }
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
      ${
        isEnabled('tags')
          ? `
        getTags {
          _id
          name
          colorCode
        }
        `
          : ``
      }
      tagIds
      description
      visibility
      selectedMemberIds
      departmentIds
      parentId
      order
      createdAt
      relatedIds
      members {
        ${userFields}
      }
    }
  }
`;

const totalCount = `
  query dashboardsTotalCount {
	  dashboardsTotalCount
  }
`;

const dashboardItems = `
  query dashboardItems($dashboardId: String!) {
    dashboardItems(dashboardId: $dashboardId) {
      _id
      layout
      vizState
      name
      type
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

const dashboardGetTypes = `
   query dashboardGetTypes {
     dashboardGetTypes
   }
`;

export default {
  dashboardItemDetail,
  dashboardItems,
  dashboardsMain,
  totalCount,
  dashboards,
  dashboardDetails,
  dashboardGetTypes,
  dashboardCountByTags
};
