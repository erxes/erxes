export const types = `
  input PermissionInput {
    module: String!
    actions: [String]!
    scope: String!
  }

  # New Permission System
  type PermissionAction {
    name: String!
    description: String!
    always: Boolean
    disabled: Boolean
  }

  type PermissionModule {
    name: String!
    description: String
    plugin: String!
    scopeField: String
    ownerFields: [String]
    actions: [PermissionAction]!
  }

  type PermissionGroupPermission {
    module: String!
    actions: [String]!
    scope: String!
  }

  type DefaultPermissionGroup {
    id: String!
    name: String!
    description: String
    plugin: String!
    permissions: [PermissionGroupPermission]!
  }

  type PermissionGroup {
    _id: String!
    name: String!
    description: String
    permissions: [PermissionGroupPermission]!
    createdAt: Date
    updatedAt: Date
  }

  type UserPermission {
    module: String!
    actions: [String]!
    scope: String!
  }

  type CustomPermission {
    module: String!
    actions: [String]!
    scope: String!
  }

  # DEPRECATED - Old system
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
    cursor: String
  }

  type PermissionListResponse {
    list: [Permission]
    pageInfo: PageInfo
    totalCount: Int
  }
`;

export const queries = `
  permissionModules: [PermissionModule]
  permissionDefaultGroups: [DefaultPermissionGroup]
  permissionGroups: [PermissionGroup]
  permissionGroupDetail(id: String!): PermissionGroup
  currentUserPermissions: [UserPermission]
`;

export const mutations = `
  permissionGroupCreate(
    name: String!
    description: String
    permissions: [PermissionInput]!
  ): PermissionGroup

  permissionGroupUpdate(
    id: String!
    name: String
    description: String
    permissions: [PermissionInput]
  ): PermissionGroup

  permissionGroupRemove(id: String!): JSON

  userUpdatePermissionGroups(userId: String!, groupIds: [String]!): User
  userAddCustomPermission(userId: String!, permission: PermissionInput!): User
  userRemoveCustomPermission(userId: String!, module: String!): User

`;
