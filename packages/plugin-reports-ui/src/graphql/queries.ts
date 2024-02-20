import { isEnabled } from '@erxes/ui/src/utils/core';
const tagsAvailable = isEnabled('tags') ? true : false;

const userFields = `
  _id
  username
  email
  employeeId
  details {
    avatar
    fullName
    firstName
    lastName
    position
  }
  departments {
    title
  }
  branches {
    title
  }
`;

const commonParams = `
$searchValue: String
$perPage: Int
$page: Int
$departmentId: String
$tag: String
`;

const commonParamsDef = `
searchValue: $searchValue
perPage: $perPage
page: $page
departmentId: $departmentId
tag: $tag
`;

const reportsList = `
  query reportsList(${commonParams}) {
    reportsList(${commonParamsDef}) {
      list {
        _id
        name
        visibility
        chartsCount
        createdAt
        createdBy{
          ${userFields}
        }
        updatedAt
        updatedBy{
          ${userFields}
        }
        members {
          ${userFields}
        }
        charts {
          _id
          name
          contentType
          templateType
          layout
          vizState
          order
          chartType
          filter
          dimension
          defaultFilter {
            fieldName
            filterValue
            filterType
          }
        }
        ${
          tagsAvailable
            ? `tags  {
            _id
            name
            colorCode
          }`
            : ``
        }
      }

      totalCount
    }
  }
`;

const reportTemplatesList = `
  query reportTemplatesList($searchValue: String, $serviceName: String) {
    reportTemplatesList(searchValue: $searchValue, serviceName: $serviceName) {
      title
      type
      description
      charts
      img
      serviceName
      serviceType
    }
  }
`;

const reportChartTemplatesList = `
query reportChartTemplatesList($serviceName: String!, $charts: [String]) {
  reportChartTemplatesList(serviceName: $serviceName, charts: $charts)
}
`;

const reportDetail = `
  query reportDetail($reportId: String!) {
    reportDetail(reportId: $reportId) {
      _id
        name
        visibility
        createdAt
        createdBy{
          ${userFields}
        }
        updatedAt
        updatedBy{
          ${userFields}
        }
        members{
          ${userFields}
        }
        charts {
          _id
          name
          contentType
          templateType
          serviceName
          order
          chartType
          layout
          vizState
          filter
          dimension
          defaultFilter {
            fieldName
            filterValue
            filterType
          }
        }

        ${
          tagsAvailable
            ? `tags  {
            _id
            name
            colorCode
          }`
            : ``
        }

        assignedDepartmentIds
        assignedUserIds
    }
  }
`;

const reportsCountByTags = `
query reportsCountByTags {
  reportsCountByTags
}
`;

const reportChartGetResult = `
query reportChartGetResult($serviceName: String!, $templateType: String!, $filter: JSON, $dimension: JSON){
  reportChartGetResult(serviceName: $serviceName, templateType: $templateType, filter: $filter , dimension: $dimension)
}
`;

const reportServicesList = `
query reportServicesList{
  reportServicesList
}`;

const brands = `
  query allBrands{
    allBrands{
      _id
      name
    }
  }
`;

const integrations = `
  query integrations($kind: String, $brandId: String) {
    integrations(kind: $kind, brandId: $brandId) {
      _id
      name
    }
  }
`;

export default {
  reportsList,
  brands,
  integrations,
  reportTemplatesList,
  reportChartTemplatesList,
  reportDetail,
  reportsCountByTags,

  reportChartGetResult,
  reportServicesList,
};
