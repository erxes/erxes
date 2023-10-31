import { queries as teamQueries } from '@erxes/ui/src/team/graphql';

const detailFields = teamQueries.detailFields;
const allUsers = teamQueries.allUsers;

const userFields = `
  _id
  email
  username
  details {
    ${detailFields}
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
  heartCount
  isHearted
  isLiked
  isPinned
  commentCount
  recipientIds
  createdUser {
    ${userFields}
  }
  updatedUser {
    ${userFields}
  }
  eventData {
    visibility
    where
    startDate
    endDate
    interestedUserIds
    goingUserIds
  }
  customFieldsData
  departmentIds
  department
  branchIds
  unitId
`;

const feed = `
  query feed($title: String, $limit: Int, $contentTypes: [ContentType]) {
    exmFeed(title: $title, limit: $limit, contentTypes: $contentTypes) {
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

const departmentField = `
  _id
  title
  description
  parentId
  code
  supervisorId
  userIds
`;

const departments = `
  query departments {
    departments {
      ${departmentField}
    }
  }
`;

export const unitField = `
  _id
  title
  description
  departmentId
  department {
    ${departmentField}
  }
  supervisorId
  supervisor {
      _id
      username
      email
      status
      isActive
      groupIds
      brandIds
      score

      details {
        ${detailFields}
      }

      links
  }
  code
  userIds
  users {
    _id
    details {
      avatar
      fullName
    }
  }
`;

const unitsMain = `
  query unitsMain {
    unitsMain {
      list {
        ${unitField}
      }
      totalCount
      totalUsersCount
    }
  }
`;

export default { feed, thanks, fields, allUsers, departments, unitsMain };
