import {
  conformityQueryFieldDefs,
  conformityQueryFields
} from 'modules/conformity/graphql/queries';

const companyFields = `
  _id
  createdAt
  modifiedAt
  avatar
  primaryName
  names
  size
  industry
  plan

  parentCompanyId
  emails
  primaryEmail
  ownerId
  phones
  primaryPhone
  leadStatus
  lifecycleState
  businessType
  description
  doNotDisturb
  links {
    linkedIn
    twitter
    facebook
    github
    youtube
    website
  }
  owner {
    _id
    details {
      fullName
    }
  }
  parentCompany {
    _id
    primaryName
  }

  customFieldsData
  tagIds
  getTags {
    _id
    name
    colorCode
  }
`;

const listParamsDef = `
  $page: Int
  $perPage: Int
  $segment: String
  $tag: String
  $ids: [String]
  $searchValue: String
  $leadStatus: String
  $lifecycleState: String
  $brand: String
  $sortField: String
  $sortDirection: Int
  ${conformityQueryFields}
`;

const listParamsValue = `
  page: $page
  perPage: $perPage
  segment: $segment
  tag: $tag
  ids: $ids
  searchValue: $searchValue
  leadStatus: $leadStatus
  lifecycleState: $lifecycleState
  brand: $brand
  sortField: $sortField
  sortDirection: $sortDirection
  ${conformityQueryFieldDefs}
`;

export const companies = `
  query companies(${listParamsDef}) {
    companies(${listParamsValue}) {
      ${companyFields}
    }
  }
`;

export const companiesMain = `
  query companiesMain(${listParamsDef}) {
    companiesMain(${listParamsValue}) {
      list {
        ${companyFields}
      }

      totalCount
    }
  }
`;

export const companyCounts = `
  query companyCounts(${listParamsDef}, $byFakeSegment: JSON, $only: String) {
    companyCounts(${listParamsValue}, byFakeSegment: $byFakeSegment, only: $only)
  }
`;

export const companyDetail = `
  query companyDetail($_id: String!) {
    companyDetail(_id: $_id) {
      ${companyFields}
      customers {
        _id
        firstName
        lastName
        primaryEmail
        primaryPhone
      }
    }
  }
`;

const tags = `
  query tags($type: String) {
    tags(type: $type) {
      _id
      name
      colorCode
    }
  }
`;

export const companiesListConfig = `
  query {
    fieldsDefaultColumnsConfig(contentType: "company") {
      name
      label
      order
    }
  }
`;

const companiesExport = `
  query companiesExport(${listParamsDef}) {
    companiesExport(${listParamsValue})
  }
`;

export default {
  companies,
  companiesMain,
  companyCounts,
  companyDetail,
  tags,
  companiesListConfig,
  companiesExport
};
