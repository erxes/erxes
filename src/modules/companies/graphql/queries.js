const companyFields = `
  _id
  name
  size
  industry
  website
  plan
  customFieldsData
`;

const listParamsDef = `
  $page: Int,
  $perPage: Int,
  $segment: String,
  $tag: String,
  $ids: [String],
  $searchValue: String
`;

const listParamsValue = `
  page: $page,
  perPage: $perPage,
  segment: $segment,
  tag: $tag,
  ids: $ids,
  searchValue: $searchValue
`;

export const companies = `
  query companies(${listParamsDef}) {
    companies(${listParamsValue}) {
      ${companyFields}
    }
  }
`;

export const companyCounts = `
  query companyCounts(${listParamsDef}) {
    companyCounts(${listParamsValue})
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
        email
        phone
      }
    }
  }
`;

export const fields = `
  query {
    fields(contentType: "company") {
      _id
      type
      validation
      text
      description
      options
      isRequired
      order
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

const activityLogsCompany = `
  query activityLogsCompany($_id: String!) {
    activityLogsCompany(_id: $_id) {
      date {
        year
        month
      }
      list {
        id
        action
        content
        createdAt
        by {
          _id
          type
          details {
            avatar
            fullName
          }
        }
      }
    }
  }
`;

export default {
  companies,
  companyCounts,
  companyDetail,
  fields,
  companiesListConfig,
  activityLogsCompany
};
