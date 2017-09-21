const engageDetailFields = `
  _id
  kind
  segmentId
  customerIds
  title
  fromUserId
  method
  email
  isDraft
  isLive
  stopDate
  createdDate
  messenger
`;

export const engageMessageDetail = `
  query engageMessageDetail($_id: String) {
    engageMessageDetail(_id: $_id){
      ${engageDetailFields}
    }
  }
`;

export const users = `
  query users {
    users {
      _id
      username
      details
    }
  }
`;

export const emailTemplates = `
  query emailTemplates {
    emailTemplates {
      _id
      name
      content
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
