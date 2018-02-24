const customerFields = `
    _id
    firstName
    lastName
    email
    phone
    isUser
    integrationId
    createdAt
    remoteAddress
    location
    visitorContactInfo

    customFieldsData
    messengerData
    twitterData
    facebookData

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

const customers = `
  query customers(${listParamsDef}) {
    customers(${listParamsValue}) {
      list {
        ${customerFields}
      }

      totalCount
    }
  }
`;

const customerCounts = `
  query customerCounts(${listParamsDef}, $byFakeSegment: JSON) {
    customerCounts(${listParamsValue}, byFakeSegment: $byFakeSegment)
  }
`;

const customerDetail = `
  query customerDetail($_id: String!) {
    customerDetail(_id: $_id) {
      ${customerFields}
      companies {
        _id
        name
        website
      }
      conversations {
        _id
        content
        createdAt
        assignedUser {
          _id
          details {
            avatar
          }
        }
        integration {
          _id
          kind
          brandId,
          brand {
            _id
            name
          }
          channels {
            _id
            name
          }
        }
        customer {
          _id
          firstName
          lastName
          email
          phone
        }
        tags {
          _id
          name
          colorCode
        }
        readUserIds
      }
    }
  }
`;

const brands = `
  query brands {
    brands {
      _id
      name
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

const customersListConfig = `
  query {
    fieldsDefaultColumnsConfig(contentType: "customer") {
      name
      label
      order
    }
  }
`;

const activityLogsCustomer = `
  query activityLogsCustomer($_id: String!) {
    activityLogsCustomer(_id: $_id) {
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
  customers,
  customerCounts,
  customerDetail,
  brands,
  tags,
  customersListConfig,
  activityLogsCustomer,
  fieldsgroups
};
