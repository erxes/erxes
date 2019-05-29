import { Permissions, UsersGroups } from '../../../db/models';
import { IPermissionParams, IUserGroup } from '../../../db/models/definitions/permissions';
import { moduleCheckPermission } from '../../permissions';

const permissionMutations = {
  /**
   * Create new permission
   * @param {String} doc.module
   * @param {[String]} doc.actions
   * @param {[String]} doc.userIds
   * @param {Boolean} doc.allowed
   * @return {Promise} newly created permission object
   */
  permissionsAdd(_root, doc: IPermissionParams) {
    return Permissions.createPermission(doc);
  },

  /**
   * Remove permission
   * @param {[String]} ids
   * @return {Promise}
   */
  permissionsRemove(_root, { ids }: { ids: string[] }) {
    return Permissions.removePermission(ids);
  },
};

const usersGroupMutations = {
  /**
   * Create new group
   * @param {String} doc.name
   * @param {String} doc.description
   * @return {Promise} newly created group object
   */
  usersGroupsAdd(_root, { memberIds, ...doc }: IUserGroup & { memberIds?: string[] }) {
    return UsersGroups.createGroup(doc, memberIds);
  },

  /**
   * Edit group
   * @param {String} doc.name
   * @param {String} doc.description
   * @return {Promise} updated group object
   */
  usersGroupsEdit(_root, { _id, memberIds, ...doc }: { _id: string; memberIds?: string[] } & IUserGroup) {
    return UsersGroups.updateGroup(_id, doc, memberIds);
  },

  /**
   * Remove group
   * @param {String} _id
   * @return {Promise}
   */
  usersGroupsRemove(_root, { _id }: { _id: string }) {
    return UsersGroups.removeGroup(_id);
  },
};

moduleCheckPermission(permissionMutations, 'managePermissions');
moduleCheckPermission(usersGroupMutations, 'manageUsersGroups');

export { permissionMutations, usersGroupMutations };
