import { IUserGroup } from 'erxes-api-shared/core-types';
import { getPlugin, getPlugins } from 'erxes-api-shared/utils';
import { IContext } from '~/connectionResolvers';
import {
  fixPermissions,
  resetPermissionsCache,
} from '~/modules/permissions/utils';

export const usersGroupMutations = {
  /**
   * Create new group
   * @param {String} doc.name
   * @param {String} doc.description
   * @return {Promise} newly created group object
   */
  async usersGroupsAdd(
    _root,
    { memberIds, ...doc }: IUserGroup & { memberIds?: string[] },
    { models }: IContext,
  ) {
    const group = await models.UsersGroups.createGroup(doc, memberIds);

    // await putCreateLog(
    //   models,
    //   subdomain,
    //   {
    //     type: MODULE_NAMES.USER_GROUP,
    //     object: group,
    //     newData: doc,
    //     description: `"${group.name}" has been created`,
    //   },
    //   user,
    // );

    // for (const oldUser of oldUsers) {
    //   const updatedDocument = {
    //     groupIds: [...(oldUser.groupIds || []), group._id],
    //   };

    //   await putUpdateLog(
    //     models,
    //     subdomain,
    //     {
    //       type: MODULE_NAMES.USER,
    //       object: oldUser,
    //       newData: updatedDocument,
    //       description: `User "${oldUser.email}" has been added to group ${group.name}`,
    //       updatedDocument,
    //     },
    //     user,
    //   );
    // }

    await resetPermissionsCache(models);

    return group;
  },

  /**
   * Edit group
   * @param {String} doc.name
   * @param {String} doc.description
   * @return {Promise} updated group object
   */
  async usersGroupsEdit(
    _root,
    {
      _id,
      memberIds,
      ...doc
    }: { _id: string; memberIds?: string[] } & IUserGroup,
    { models }: IContext,
  ) {
    const result = await models.UsersGroups.updateGroup(_id, doc, memberIds);

    await resetPermissionsCache(models);

    return result;
  },

  /**
   * Remove group
   * @param {String} _id
   * @return {Promise}
   */
  async usersGroupsRemove(
    _root,
    { _id }: { _id: string },
    { models }: IContext,
  ) {
    const result = await models.UsersGroups.removeGroup(_id);

    await resetPermissionsCache(models);

    return result;
  },

  async usersGroupsCopy(
    _root,
    { _id, memberIds }: { _id: string; memberIds: string[] },
    { models }: IContext,
  ) {
    const group = await models.UsersGroups.getGroup(_id);

    const clone = await models.UsersGroups.copyGroup(group._id, memberIds);

    return clone;
  },

  async permissionsFix(_root, _params, { models }: IContext) {
    const services = await getPlugins();
    let messages: string[] = [];

    for (const name of services) {
      const service = await getPlugin(name);
      if (!service) continue;
      if (!service.config) continue;

      const permissions =
        service.config.meta?.permissions || service.config.permissions;
      if (!permissions) continue;

      const result = await fixPermissions(models, permissions);

      messages = [...messages, ...result];
    }

    await resetPermissionsCache(models);

    return messages;
  },
};
