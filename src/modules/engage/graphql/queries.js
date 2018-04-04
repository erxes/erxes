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
        details {
          avatar
          fullName
          position
          twitterUsername
        }
      }
      tagIds
      stats
      getTags {
        _id
        name
        colorCode
      }
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
  stats
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
      details {
        avatar
        fullName
        position
        twitterUsername
      }
    }
  }
`;

const userDetail = `
  query userDetail($_id: String) {
    userDetail(_id: $_id) {
      _id
      username
      details {
        avatar
        fullName
        position
        twitterUsername
      }
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
    $page: Int,
    $perPage: Int,
    $segment: String,
    $tag: String,
    $ids: [String]
  ) {
    customerCounts(
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

const segmentDetail = `
  query segmentDetail($_id: String) {
    segmentDetail(_id: $_id) {
      ${segmentFields}
      getSubSegments {
        ${segmentFields}
      }
    }
  }
`;

const headSegments = `
  query headSegments {
    segmentsGetHeads {
      ${segmentFields}
      getSubSegments {
        ${segmentFields}
      }
    }
  }
`;

const combinedFields = `
  query fieldsCombinedByContentType {
    fieldsCombinedByContentType(contentType: "customer")
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
  customerCounts,
  segmentDetail,
  headSegments,
  combinedFields
};
