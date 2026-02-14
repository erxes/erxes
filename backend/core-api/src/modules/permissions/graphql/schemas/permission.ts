export const types = `
  input PermissionInput {
    plugin: String!
    module: String!
    actions: [String]!
    scope: String!
  }


  type PermissionAction {
    title: String
    name: String!
    description: String!
    always: Boolean
    disabled: Boolean
  }

  type PermissionScopeDescription {
    name: String!
    description: String!
  }

  type PermissionModule {
    name: String!
    description: String
    scopes: [PermissionScopeDescription]
    plugin: String! 
    scopeField: String
    ownerFields: [String]
    actions: [PermissionAction]!
    always: Boolean
  }

  type PermissionModulesByPlugin {
    plugin: String!
    modules: [PermissionModule]!
  }

  type PermissionGroupPermission {
    plugin: String!
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
    plugin: String!
    module: String!
    actions: [String]!
    scope: String!
  }

`;

export const queries = `
  permissionModules: [PermissionModulesByPlugin]
  permissionDefaultGroups: [DefaultPermissionGroup]
  permissionGroups: [PermissionGroup]
  permissionGroupDetail(id: String!): PermissionGroup
  currentUserPermissions: [UserPermission]
`;

export const mutations = `
  permissionGroupAdd(
    name: String!
    description: String
    permissions: [PermissionInput]!
  ): PermissionGroup

  permissionGroupEdit(
    _id: String!
    name: String
    description: String
    permissions: [PermissionInput]
  ): PermissionGroup

  permissionGroupRemove(_id: String!): JSON

  userUpdatePermissionGroups(userId: String!, groupIds: [String]!): User
  userAddCustomPermission(userId: String!, permission: PermissionInput!): User
  userRemoveCustomPermission(userId: String!, module: String!): User

`;
