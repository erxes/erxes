const engageMessages = `
  query engageMessages($kind: String, $status: String, $tag: String) {
    engageMessages(kind: $kind, status: $status, tag: $tag) {
      _id
      title
      deliveryReports
      isDraft
      isLive
      createdDate
      segment {
        _id
        name
      }
      fromUser {
        _id
        details
      }
      tagIds
      messenger
      email
    }
  }
`;

const tags = `
  query tags($type: String) {
    tags(type: $type) {
      _id
      name
      type
      colorCode
    }
  }
`;

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

export default {
  engageMessages,
  engageMessageDetail,
  users,
  segments,
  tags,
  emailTemplates,
  customerCounts
};
