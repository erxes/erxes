const companyFields = `
  _id
  name
  size
  industry
  website
  plan
  customFieldsData
`;

export const companies = `
  query companies($params: CompanyListParams) {
    companies(params: $params) {
      ${companyFields}
    }
  }
`;

export const companyCounts = `
  query companyCounts($params: CompanyListParams) {
    companyCounts(params: $params)
  }
`;

export const companyDetail = `
  query companyDetail($_id: String!) {
    companyDetail(_id: $_id) {
      ${companyFields}

      customers {
        name
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
