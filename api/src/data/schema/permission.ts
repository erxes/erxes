export const types = `
  type Permission {
    _id: String!
    module: String
    action: String
    userId: String
    groupId: String
    requiredActions: [String]
    allowed: Boolean
    user: User
    group: UsersGroup
  }
  type PermissionModule {
    name: String
    description: String
  }
  type PermissionAction {
    name: String
    description: String
    module: String
  }

  type UsersGroup {
    _id: String!
    name: String!
    description: String!
    memberIds: [String]
    members: [User]
  }
`;

const commonParams = `
  module: String,
  action: String,
  userId: String,
  groupId: String,
  allowed: Boolean
`;

const commonUserGroupParams = `
  name: String!,
  description: String,
  memberIds: [String],
`;

export const queries = `
  permissions(${commonParams}, page: Int, perPage: Int): [Permission]
  permissionModules: [PermissionModule]
  permissionActions: [PermissionAction]
  permissionsTotalCount(${commonParams}): Int
  usersGroups(page: Int, perPage: Int): [UsersGroup]
  usersGroupsTotalCount: Int
`;

export const mutations = `
	permissionsAdd(
    module: String!,
    actions: [String!]!,
    userIds: [String!],
    groupIds: [String!],
    allowed: Boolean
  ): [Permission]
  permissionsRemove(ids: [String]!): JSON
  usersGroupsAdd(${commonUserGroupParams}): UsersGroup
  usersGroupsEdit(_id: String!, ${commonUserGroupParams}): UsersGroup
  usersGroupsRemove(_id: String!): JSON
  usersGroupsCopy(_id: String!, memberIds: [String]): UsersGroup
`;
