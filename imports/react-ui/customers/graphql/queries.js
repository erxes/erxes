const customerFields = `
    _id
    name
    email
    phone
    isUser
    integrationId
    createdAt
    messengerData
    twitterData
    facebookData
    tagIds
    internalNotes
    getTags {
      _id
      name
    }
`;

export const customers = `
  query customers($params: CustomerListParams) {
    customers(params: $params) {
      ${customerFields}
    }
  }
`;

export const customerCounts = `
  query customerCounts($params: CustomerListParams) {
    customerCounts(params: $params)
  }
`;

export const customerDetail = `
  query customerDetail($_id: String!) {
    customerDetail(_id: $_id) {
      ${customerFields}
      conversations {
        _id
        content
        tags {
          _id
          name
        }
      }
    }
  }
`;

const segmentFields = `
  _id
  name
  description
  subOf
  color
  connector
  conditions
`;

export const segments = `
  query segments {
    segments {
      ${segmentFields}

      getSubSegments {
        ${segmentFields}
      }
    }
  }
`;

export const brands = `
  query brands {
    brands {
      _id
      name
    }
  }
`;

export const tags = `
  query tags($type: String) {
    tags(type: $type) {
      _id
      name
    }
  }
`;

export const totalCustomersCount = `
  query totalCustomersCount {
    totalCustomersCount
  }
`;
