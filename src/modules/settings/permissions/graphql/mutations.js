const commonParamsDef = `
  $module: String!,
  $actions: [String!]!,
  $userIds: [String!]!,
  $allowed: Boolean,
`;

const commonParams = `
  module: $module,
  actions: $actions,
  userIds: $userIds,
  allowed: $allowed,
`;

const permissionAdd = `
  mutation permissionsAdd(${commonParamsDef}) {
    permissionsAdd(${commonParams}) {
      _id
    }
  }
`;

const permissionRemove = `
  mutation permissionsRemove($ids: [String]!) {
    permissionsRemove(ids: $ids)
  }
`;

export default {
  permissionAdd,
  permissionRemove
};
