const userFields = `
  _id
  email
  username
  details {
    fullName
    avatar
  }
`;

const commonFeedFields = `
  _id
  title
  description
  contentType
  images
  attachments
  createdAt
  updatedAt
  likeCount
  commentCount
  recipientIds
  createdUser {
    ${userFields}
  }
  updatedUser {
    ${userFields}
  }
  customFieldsData
`;

const feed = `
  query feed($title: String, $limit: Int) {
    exmFeed(title: $title, limit: $limit) {
      list {
        ${commonFeedFields}
      }

      totalCount
    }
  }
`;

const thanks = `
  query thanks($limit: Int) {
    exmThanks(limit: $limit) {
      list {
        _id
        description
        createdAt
        createdUser {
          ${userFields}
        }
        recipients {
          ${userFields}
        }
        recipientIds
      }

      totalCount
    }
  }
`;

const fields = `
  query fields($contentType: String!) {
    fields(contentType: $contentType) {
      _id
      text
      options
      type
    }
  }
`;

export default { feed, thanks, fields };
