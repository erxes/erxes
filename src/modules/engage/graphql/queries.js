const engageMessages = `
  query engageMessages($kind: String, $status: String, $tag: String, $ids: [String]) {
    engageMessages(kind: $kind, status: $status, tag: $tag, ids: $ids) {
      _id
      title
      deliveryReports
      isDraft
      isLive
      createdDate
      kind
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

const engageMessageDetail = `
  query engageMessageDetail($_id: String) {
    engageMessageDetail(_id: $_id){
      ${engageDetailFields}
    }
  }
`;

const users = `
  query users {
    users {
      _id
      username
      details
    }
  }
`;

const userDetail = `
  query userDetail($_id: String) {
    userDetail(_id: $_id) {
      _id
      username
      details
      email
    }
  }
`;

const emailTemplates = `
  query emailTemplates {
    emailTemplates {
      _id
      name
      content
    }
  }
`;

const engageMessagesTotalCount = `
  query engageMessagesTotalCount {
    engageMessagesTotalCount
  }
`;

const customerCounts = `
  query customerCounts(
    $limit: Int,
    $page: Int,
    $perPage: Int,
    $segment: String,
    $tag: String,
    $ids: [String]
  ) {
    customerCounts(
      limit: $limit,
      page: $page,
      perPage: $perPage,
      segment: $segment,
      tag: $tag,
      ids: $ids,
    )
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

const segments = `
  query segments {
    segments(contentType: "customer") {
      ${segmentFields}

      getSubSegments {
        ${segmentFields}
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

export default {
  engageMessages,
  engageMessagesTotalCount,
  engageMessageDetail,
  users,
  userDetail,
  segments,
  brands,
  tags,
  emailTemplates,
  customerCounts
};
