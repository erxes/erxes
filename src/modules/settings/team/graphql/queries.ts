const userDetail = `
  query userDetail($_id: String) {
    userDetail(_id: $_id) {
      _id
      username
      email
      role
      status

      details {
        avatar
        fullName
        shortName
        position
        location
        description
      }
      links {
        linkedIn
        twitter
        facebook
        github
        youtube
        website
      }
      emailSignatures
      getNotificationByEmail
    }
  }
`;

const userActivityLog = `
  query activityLogsUser($_id: String!) {
    activityLogsUser(_id: $_id) {
      date {
        year
        month
      }
      list {
        id
        action
        content
        createdAt
        by {
          _id
          type
          details {
            avatar
            fullName
          }
        }
      }
    }
  }
`;

const userConversations = `
  query userConversations($_id: String!, $perPage: Int) {
    userConversations(_id: $_id, perPage: $perPage) {
    list {
      _id
      createdAt
      customer {
        _id
        firstName
        lastName
        primaryEmail
        primaryPhone
        }
      }
      totalCount
    }
  }
`;

const channels = `
  query channels($memberIds: [String]) {
    channels(memberIds: $memberIds) {
      _id
      name
      description
      memberIds
    }
  }
`;

const listParamsDef = `
  $searchValue: String,
  $isActive: Boolean
`;

const listParamsValue = `
  searchValue: $searchValue,
  isActive: $isActive
`;

const users = `
  query users($page: Int, $perPage: Int, ${listParamsDef}) {
    users(page: $page, perPage: $perPage, ${listParamsValue}) {
      _id
      username
      email
      role
      status
      isActive
      details {
        avatar
        fullName
        shortName
        position
        description
        location
      }
      links {
        linkedIn
        twitter
        facebook
        github
        youtube
        website
      }
    }
  }
`;

const usersTotalCount = `
  query usersTotalCount(${listParamsDef}) {
    usersTotalCount(${listParamsValue})
  }
`;

export default {
  userDetail,
  channels,
  userActivityLog,
  userConversations,
  users,
  usersTotalCount
};
