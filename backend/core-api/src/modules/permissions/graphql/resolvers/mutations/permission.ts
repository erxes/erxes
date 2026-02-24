import { IPermissionParams } from 'erxes-api-shared/core-types';
import { IContext } from '~/connectionResolvers';
import { resetPermissionsCache } from '~/modules/permissions/utils';

export const permissionMutations = {
  /**
   * Create new permission
   * @param {String} doc.module
   * @param {[String]} doc.actions
   * @param {[String]} doc.userIds
   * @param {Boolean} doc.allowed
   * @return {Promise} newly created permission object
   */
  async permissionsAdd(_root, doc: IPermissionParams, { models }: IContext) {
    const result = await models.Permissions.createPermission(doc);

    await resetPermissionsCache(models);

    return result;
  },

  /**
   * Remove permission
   * @param {[String]} ids
   * @return {Promise}
   */
  async permissionsRemove(
    _root,
    { ids }: { ids: string[] },
    { models }: IContext,
  ) {
    const result = await models.Permissions.removePermission(ids);

    await resetPermissionsCache(models);

    return result;
  },
};
