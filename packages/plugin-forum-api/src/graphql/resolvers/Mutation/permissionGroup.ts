import { IContext } from '../..';
import { IObjectTypeResolver } from '@graphql-tools/utils';
import { moduleRequireLogin } from '@erxes/api-utils/src/permissions';

const permissionGroupMutations: IObjectTypeResolver<any, IContext> = {
  async forumPermissionGroupCreate(_, params, { models: { PermissionGroup } }) {
    return PermissionGroup.createPermissionGroup(params);
  },
  async forumPermissionGroupPatch(_, params, { models: { PermissionGroup } }) {
    const { _id, ...patch } = params;
    return PermissionGroup.patchPermissionGroup(_id, patch);
  },
  async forumPermissionGroupDelete(
    _,
    { _id },
    { models: { PermissionGroup } }
  ) {
    return PermissionGroup.deletePermissionGroup(_id);
  },
  async forumPermissionGroupAddUsers(
    _,
    { _id, cpUserIds },
    { models: { PermissionGroupUser } }
  ) {
    await PermissionGroupUser.addUsersToPermissionGroups(cpUserIds || [], [
      _id
    ]);
    return true;
  },
  async forumPermissionGroupRemoveUser(
    _,
    { _id, cpUserId },
    { models: { PermissionGroupUser } }
  ) {
    await PermissionGroupUser.removeUsersFromPermissionGroups(
      [cpUserId],
      [_id]
    );
    return true;
  },
  async forumPermissionGroupAddCategoryPermit(
    _,
    { _id, categoryIds, permission },
    { models: { PermissionGroupCategoryPermit } }
  ) {
    await PermissionGroupCategoryPermit.givePermission(
      _id,
      categoryIds,
      permission
    );
    return true;
  },
  async forumPermissionGroupRemoveCategoryPermit(
    _,
    { _id, categoryIds, permission },
    { models: { PermissionGroupCategoryPermit } }
  ) {
    await PermissionGroupCategoryPermit.removePermission(
      _id,
      categoryIds,
      permission
    );
    return true;
  },

  async forumPermissionGroupSetUsers(
    _,
    { _id, cpUserIds },
    { models: { PermissionGroupUser } }
  ) {
    await PermissionGroupUser.setUsers(_id, cpUserIds);
    return true;
  }
};

moduleRequireLogin(permissionGroupMutations);

export default permissionGroupMutations;
