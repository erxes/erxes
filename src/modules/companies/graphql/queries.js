const companyFields = `
  _id
  name
  size
  industry
  website
  plan
  customFieldsData
  tagIds
  getTags {
    _id
    name
    colorCode
  }
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

const fieldsgroups = `
  query fieldsgroups($contentType: String!) {
    fieldsgroups(contentType: $contentType) {
      _id
      name
      description
      order
      visible
      lastUpdatedBy {
        details {
          fullName
        }
      }
      isDefinedByErxes
      getFields {
        _id
        contentType
        type
        text
        visible
        validation
        order
        options
        groupId
        description
        isDefinedByErxes
        lastUpdatedBy {
          details {
            fullName
          }
        }
      }
    }
  }
`;

export default {
  companies,
  companiesMain,
  companyCounts,
  companyDetail,
  tags,
  companiesListConfig,
  activityLogsCompany,
  fieldsgroups
};
