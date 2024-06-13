const commonParamsDef = `
  $module: String,
  $action: String,
  $userId: String,
  $groupId: String,
  $allowed: Boolean
`;

const commonParams = `
  module: $module,
  action: $action,
  userId: $userId,
  groupId: $groupId
  allowed: $allowed
`;

const usersGroups = `
  query usersGroups($page: Int, $perPage: Int) {
    usersGroups(page: $page, perPage: $perPage) {
      _id
      name
      description
      memberIds
      members {
        _id
        isActive
        details {
          fullName
          avatar
        }
      }
    }
  }
`;

const userTotalCount = `
  query usersGroupsTotalCount {
    usersGroupsTotalCount
  }
`;

const permissions = `
  query permissions(${commonParamsDef}, $page: Int,  $perPage: Int) {
    permissions(${commonParams}, page: $page, perPage: $perPage) {
      _id
      module
      action
      userId
      groupId
      allowed
      user {
        _id
        username
        email
      }
      group {
        _id
        name
      }
    }
  }
`;

const modules = `
  query permissionModules {
    permissionModules {
      name
      description
    }
  }
`;

const actions = `
  query permissionActions {
    permissionActions {
      name
      description
      module
    }
  }
`;

const totalCount = `
  query permissionsTotalCount(${commonParamsDef}) {
    permissionsTotalCount(${commonParams})
  }
`;

export default {
  permissions,
  modules,
  actions,
  totalCount,
  userTotalCount,
  usersGroups
};
