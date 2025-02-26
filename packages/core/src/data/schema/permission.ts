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

  type PermissionAction {
    name: String
    description: String
    module: String
  }

  type PermissionModule {
    name: String
    description: String
    actions: [PermissionAction]
  }

  type UsersGroup {
    _id: String!
    name: String!
    description: String
    memberIds: [String]
    members: [User]
    branchIds: [String]
    departmentIds:[String]
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
  branchIds: [String],
  departmentIds: [String],
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
  permissionsFix: [String]
  usersGroupsAdd(${commonUserGroupParams}): UsersGroup
  usersGroupsEdit(_id: String!, ${commonUserGroupParams}): UsersGroup
  usersGroupsRemove(_id: String!): JSON
  usersGroupsCopy(_id: String!, memberIds: [String]): UsersGroup
`;
