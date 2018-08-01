const companyFields = `
  _id
  primaryName
  names
  size
  industry
  website

  parentCompanyId
  email
  ownerId
  phone
  leadStatus
  lifecycleState
  businessType
  description
  employees
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
    details {
      fullName
    }
  }
  parentCompany {
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
  $page: Int,
  $perPage: Int,
  $segment: String,
  $tag: String,
  $ids: [String],
  $searchValue: String
  $leadStatus: String
`;

const listParamsValue = `
  page: $page,
  perPage: $perPage,
  segment: $segment,
  tag: $tag,
  ids: $ids,
  searchValue: $searchValue
  leadStatus: $leadStatus
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
        primaryEmail
        primaryPhone
      }
      deals {
        _id
        companies {
          _id
          primaryName
        }
        customers {
          _id
          firstName
          primaryEmail
        }
        products
        amount
        closeDate
        assignedUsers {
          _id
          email
          details {
            fullName
            avatar
          }
        }
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

export default {
  companies,
  companiesMain,
  companyCounts,
  companyDetail,
  tags,
  companiesListConfig,
  activityLogsCompany
};
