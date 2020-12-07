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
  businessType
  description
  doNotDisturb
  code
  links
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
  $excludeIds: Boolean
  $searchValue: String
  $autoCompletion: Boolean
  $autoCompletionType: String
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
  excludeIds: $excludeIds
  searchValue: $searchValue
  autoCompletion: $autoCompletion
  autoCompletionType: $autoCompletionType
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
  query companyCounts(${listParamsDef}, $only: String) {
    companyCounts(${listParamsValue}, only: $only)
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
