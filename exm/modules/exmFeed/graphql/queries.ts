import { queries as teamQueries } from '../../common/team/graphql';

const detailFields = teamQueries.detailFields;
const allUsers = teamQueries.allUsers;
const users = teamQueries.users;

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
  branchIds
  unitId
`;

const feed = `
  query feed($title: String, $limit: Int, $skip: Int, $contentTypes: [ContentType]) {
    exmFeed(title: $title, limit: $limit, skip: $skip, contentTypes: $contentTypes) {
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

const branches = `
  query branches {
    branches {
      _id,
      code,
      title,
      parentId
    }
  }
`;

const unitsMain = `
  query unitsMain {
    unitsMain {
      list {
        _id
        title
      }
    }
  }
`;

const chats = `
  query chats($type: ChatType, $limit: Int, $skip: Int) {
    chats(type: $type, limit: $limit, skip: $skip) {
      list {
        _id
        name
        type
        isSeen
        isPinned
        lastMessage {
          content
          createdAt
          createdUser {
            _id
          }
          seenList {
            seenDate
            user {
              _id
            }
            lastSeenMessageId
          }
        }
        createdUser {
          _id
          email
          details {
            avatar
            description
            fullName
            operatorPhone
          }
        }
        createdAt
        participantUsers {
          _id
          email
          details {
            avatar
            description
            fullName
            position
            operatorPhone
          }
        }
      }
      totalCount
    }
  }
`;

const chatDetail = `
  query chatDetail($id: String!) {
    chatDetail(_id: $id) {
      _id
      name
      type
      isSeen
      lastMessage {
        createdAt
        content
      }
      createdUser {
        _id
        email
        details {
          avatar
          description
          fullName
          operatorPhone
        }
      }
      createdAt
      participantUsers {
        _id
        email
        employeeId
        isAdmin
        departments {
          title
        }
        branches {
          title
        }
        details {
          avatar
          description
          fullName
          operatorPhone
          position
        }
      }
    }
  }
`;

const chatMessages = `
  query chatMessages($chatId: String, $limit: Int, $skip: Int) {
    chatMessages(chatId: $chatId, limit: $limit, skip: $skip) {
      list {
        _id
        content
        attachments
        createdUser {
          _id
          email
          details {
            avatar
            fullName
          }
        }
        createdAt
        relatedMessage {
          _id
          content
          createdUser {
            _id
            email
            details {
              avatar
              fullName
            }
          }
        }
        seenList {
          lastSeenMessageId
        }
      }
      totalCount
    }
  }
`;

const getChatIdByUserIds = `
  query getChatIdByUserIds($userIds: [String]) {
    getChatIdByUserIds(userIds: $userIds)
  }
`;

const comments = `
  query comments($contentId: String!, $contentType: ReactionContentType!, $parentId: String) {
    comments(contentId: $contentId, contentType: $contentType, parentId: $parentId) {
      list {
        _id
        comment
        createdUser {
          _id
          details {
            avatar
            firstName
            fullName
            lastName
            position
          }
          email
          username
        }
        createdAt
        parentId
        contentId
      }
    }
  }
`;

const emojiCount = `
  query emojiCount($contentId: String!, $contentType: ReactionContentType!, $type: String!) {
    emojiCount(contentId: $contentId, contentType: $contentType, type: $type)
  }
`;

const emojiIsReacted = `
  query emojiIsReacted($contentId: String!, $contentType: ReactionContentType!, $type: String!) {
    emojiIsReacted(contentId: $contentId, contentType: $contentType, type: $type)
  }
`;

export default {
  feed,
  thanks,
  fields,
  users,
  allUsers,
  departments,
  chats,
  chatDetail,
  chatMessages,
  getChatIdByUserIds,
  branches,
  unitsMain,
  comments,
  emojiCount,
  emojiIsReacted
};
