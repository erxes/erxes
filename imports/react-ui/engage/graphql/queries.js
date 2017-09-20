export const users = `
  query users {
    users {
      _id
      username
      details
    }
  }
`;

export const customerCounts = `
  query customerCounts($params: CustomerListParams) {
    customerCounts(params: $params)
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
