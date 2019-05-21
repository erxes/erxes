const userDetail = `
  query userDetail($_id: String) {
    userDetail(_id: $_id) {
      _id
      username
      email
      status
      groupIds

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
      status
      isActive
      groupIds
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

const usersForSelector = `
  query users {
    users {
      _id
      email
      username
      details {
        avatar
        fullName
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
  userConversations,
  users,
  usersTotalCount,
  usersForSelector
};
