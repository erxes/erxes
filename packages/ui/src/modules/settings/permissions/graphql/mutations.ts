const commonUserGroupParamsDef = `
  $name: String!,
  $description: String,
  $memberIds: [String],
`;

const commonUserGroupParams = `
  name: $name,
  description: $description,
  memberIds: $memberIds,
`;

const commonParamsDef = `
  $module: String!,
  $actions: [String!]!,
  $userIds: [String!],
  $groupIds: [String!],
  $allowed: Boolean,
`;

const commonParams = `
  module: $module,
  actions: $actions,
  userIds: $userIds,
  groupIds: $groupIds,
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

const usersGroupsAdd = `
  mutation usersGroupsAdd(${commonUserGroupParamsDef}) {
    usersGroupsAdd(${commonUserGroupParams}) {
      _id
    }
  }
`;

const usersGroupsEdit = `
  mutation usersGroupsEdit($_id: String!, ${commonUserGroupParamsDef}) {
    usersGroupsEdit(_id: $_id, ${commonUserGroupParams}) {
      _id
    }
  }
`;

const usersGroupsRemove = `
  mutation usersGroupsRemove($_id: String!) {
    usersGroupsRemove(_id: $_id)
  }
`;

const usersGroupsCopy = `
  mutation usersGroupsCopy($_id: String!, $memberIds: [String]) {
    usersGroupsCopy(_id: $_id, memberIds: $memberIds) {
      _id
    }
  }
`;

const permissionsFix = `
  mutation permissionsFix {
    permissionsFix
  }
`;

export default {
  permissionsFix,
  permissionAdd,
  permissionRemove,
  usersGroupsAdd,
  usersGroupsEdit,
  usersGroupsRemove,
  usersGroupsCopy
};
