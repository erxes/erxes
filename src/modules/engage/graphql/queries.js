const engageMessages = `
  query engageMessages(
    $kind: String
    $status: String
    $tag: String
    $ids: [String]
    $page: Int
    $perPage: Int
  ) {
    engageMessages(
      kind: $kind
      status: $status
      tag: $tag
      ids: $ids
      page: $page
      perPage: $perPage
    ) {

      _id
      title
      deliveryReports
      isDraft
      isLive
      createdDate
      kind
      brand {
        name
      }
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
  scheduleDate {
    type
    month
    day
    time
  }
  stats
  brand {
    name
  }
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

const kindCounts = `
  query kindCounts {
    engageMessageCounts(name: "kind")
  }
`;

const statusCounts = `
  query statusCounts($kind: String) {
    engageMessageCounts(name: "status", kind: $kind)
  }
`;

const tagCounts = `
  query tagCounts($kind: String, $status: String) {
    engageMessageCounts(name: "tag", kind: $kind, status: $status)
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
  emailTemplates,
  customerCounts,
  segmentDetail,
  headSegments,
  combinedFields,
  kindCounts,
  statusCounts,
  tagCounts
};
