import { Permissions, UsersGroups } from '../../../db/models';
import { IPermissionParams, IUserGroup } from '../../../db/models/definitions/permissions';
import { resetPermissionsCache } from '../../permissions/utils';
import { moduleCheckPermission } from '../../permissions/wrappers';

const permissionMutations = {
  /**
   * Create new permission
   * @param {String} doc.module
   * @param {[String]} doc.actions
   * @param {[String]} doc.userIds
   * @param {Boolean} doc.allowed
   * @return {Promise} newly created permission object
   */
  async permissionsAdd(_root, doc: IPermissionParams) {
    const result = await Permissions.createPermission(doc);

    resetPermissionsCache();
    return result;
  },

  /**
   * Remove permission
   * @param {[String]} ids
   * @return {Promise}
   */
  async permissionsRemove(_root, { ids }: { ids: string[] }) {
    const result = await Permissions.removePermission(ids);

    resetPermissionsCache();
    return result;
  },
};

const usersGroupMutations = {
  /**
   * Create new group
   * @param {String} doc.name
   * @param {String} doc.description
   * @return {Promise} newly created group object
   */
  async usersGroupsAdd(_root, { memberIds, ...doc }: IUserGroup & { memberIds?: string[] }) {
    const result = await UsersGroups.createGroup(doc, memberIds);

    resetPermissionsCache();
    return result;
  },

  /**
   * Edit group
   * @param {String} doc.name
   * @param {String} doc.description
   * @return {Promise} updated group object
   */
  async usersGroupsEdit(_root, { _id, memberIds, ...doc }: { _id: string; memberIds?: string[] } & IUserGroup) {
    const result = await UsersGroups.updateGroup(_id, doc, memberIds);

    resetPermissionsCache();
    return result;
  },

  /**
   * Remove group
   * @param {String} _id
   * @return {Promise}
   */
  async usersGroupsRemove(_root, { _id }: { _id: string }) {
    const result = await UsersGroups.removeGroup(_id);

    resetPermissionsCache();
    return result;
  },
};

moduleCheckPermission(permissionMutations, 'managePermissions');
moduleCheckPermission(usersGroupMutations, 'manageUsersGroups');

export { permissionMutations, usersGroupMutations };
