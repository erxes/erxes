const detailFields = `
  avatar
  fullName
  shortName
  position
  location
  description
  operatorPhone
`;

const userDetail = `
  query userDetail($_id: String) {
    userDetail(_id: $_id) {
      _id
      username
      email
      status
      groupIds

      details {
        ${detailFields}
      }
      links
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

const listParamsDef = `
  $searchValue: String,
  $isActive: Boolean,
  $ids: [String],
  $brandIds: [String]
`;

const listParamsValue = `
  searchValue: $searchValue,
  isActive: $isActive,
  ids: $ids,
  brandIds: $brandIds
`;

const users = `
  query users($page: Int, $perPage: Int, $status: String, $fetchExtra: Boolean, ${listParamsDef}) {
    users(page: $page, perPage: $perPage, status: $status, fetchExtra: $fetchExtra, ${listParamsValue}) {
      _id
      username
      email
      status
      isActive
      groupIds
      brandIds

      details {
        ${detailFields}
      }

      links
    }
  }
`;

const allUsers = `
  query allUsers($isActive: Boolean) {
    allUsers(isActive: $isActive) {
      _id
      email
      username
      isActive
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
  userConversations,
  users,
  usersTotalCount,
  allUsers
};
