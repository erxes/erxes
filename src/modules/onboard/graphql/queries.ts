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

const users = `
  query users($page: Int, $perPage: Int, $searchValue: String) {
    users(page: $page, perPage: $perPage, searchValue: $searchValue) {
      _id
      username
      email
      role
    }
  }
`;

const userTotalCount = `
  query totalUsersCount {
    usersTotalCount
  }
`;

export default {
  channels,
  users,
  userTotalCount
};
