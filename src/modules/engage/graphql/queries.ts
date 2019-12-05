const listParamsDef = `
  $kind: String
  $status: String
  $tag: String
  $ids: [String]
  $tagIds: [String]
  $brandIds: [String]
  $segmentIds: [String]
  $page: Int
  $perPage: Int
`;

const listParamsValue = `
  kind: $kind
  status: $status
  tag: $tag
  ids: $ids
  tagIds: $tagIds
  brandIds: $brandIds
  segmentIds: $segmentIds
  page: $page
  perPage: $perPage
`;

const engageMessages = `
  query engageMessages(${listParamsDef}) {
    engageMessages(${listParamsValue}) {
      _id
      title
      isDraft
      isLive
      createdAt
      kind
      method
      brands {
        name
      }
      segments {
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
      brandIds 
      segmentIds 
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

export const engageDetailFields = `
  _id
  kind
  segmentIds
  tagIds
  brandIds
  customerIds
  title
  fromUserId
  method
  email
  isDraft
  isLive
  stopDate
  createdAt
  messenger
  fromUser {
    email
    details {
      fullName
    }
  }
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
    allUsers(isActive: true) {
      _id
      username
      email
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
  query engageMessagesTotalCount(${listParamsDef}) {
    engageMessagesTotalCount(${listParamsValue})
  }
`;

const customerCounts = `
  query customerCounts(
    $page: Int,
    $perPage: Int,
    $segment: String,
    $brand: String,
    $tag: String,
    $ids: [String],
    $only: String
  ) {
    customerCounts(
      page: $page,
      perPage: $perPage,
      segment: $segment,
      brand: $brand,
      tag: $tag,
      ids: $ids,
      only: $only
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

const tags = `
  query tagsQuery($type: String) {
    tags(type: $type) {
      _id
      name
      type
      colorCode
      createdAt
      objectCount
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
    fieldsCombinedByContentType(contentType: "customer", source: "fromSegments")
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

const verifiedEmails = `
  query engageVerifiedEmails {
    engageVerifiedEmails
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
  tagCounts,
  tags,
  verifiedEmails
};
