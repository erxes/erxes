import * as _ from 'underscore';

import {
  IPermissionParams,
  IUserGroup,
  IUserGroupDocument
} from '../../../db/models/definitions/permissions';
import { IUserDocument } from '../../../db/models/definitions/users';
import { putCreateLog, putDeleteLog, putUpdateLog } from '../../logUtils';
import { fixPermissions, resetPermissionsCache } from '../../permissions/utils';
import { moduleCheckPermission } from '../../permissions/wrappers';
import { MODULE_NAMES } from '../../constants';
import { IContext, IModels } from '../../../connectionResolver';

interface IParams {
  memberIds?: string[];
  oldUsers: IUserDocument[];
  group: IUserGroupDocument;
  currentUser: IUserDocument;
}

const writeUserLog = async (
  models: IModels,
  subdomain: string,
  params: IParams
) => {
  const { memberIds = [], oldUsers = [], group, currentUser } = params;

  for (const oldUser of oldUsers) {
    const exists = memberIds.find(id => id === oldUser._id);

    if (!exists) {
      const groupIds = oldUser.groupIds
        ? oldUser.groupIds.filter(item => item !== group._id)
        : [];
      // user has been removed from the group
      await putUpdateLog(
        models,
        subdomain,
        {
          type: MODULE_NAMES.USER,
          object: { _id: oldUser._id, groupIds: oldUser.groupIds },
          newData: { groupIds },
          description: `User "${oldUser.email}" has been removed from group "${group.name}"`,
          updatedDocument: { groupIds }
        },
        currentUser
      );
    }
  } // end oldUser loop

  for (const memberId of memberIds) {
    const exists = oldUsers.find(usr => usr._id === memberId);

    // user has been added to the group
    if (!exists) {
      // already updated user row
      const addedUser = await models.Users.findOne({
        _id: memberId
      });

      if (addedUser) {
        // previous data was like this
        const groupIds = (addedUser.groupIds || []).filter(
          groupId => groupId !== group._id
        );
        await putUpdateLog(
          models,
          subdomain,
          {
            type: MODULE_NAMES.USER,
            object: { _id: memberId, groupIds },
            newData: { groupIds: addedUser.groupIds },
            description: `User "${addedUser.email}" has been added to group ${group.name}`,
            updatedDocument: { groupIds: addedUser.groupIds }
          },
          currentUser
        );
      }
    }
  } // end new user loop
};

const permissionMutations = {
  /**
   * Create new permission
   * @param {String} doc.module
   * @param {[String]} doc.actions
   * @param {[String]} doc.userIds
   * @param {Boolean} doc.allowed
   * @return {Promise} newly created permission object
   */
  async permissionsAdd(
    _root,
    doc: IPermissionParams,
    { user, models, subdomain }: IContext
  ) {
    const result = await models.Permissions.createPermission(doc);

    for (const perm of result) {
      await putCreateLog(
        models,
        subdomain,
        {
          type: MODULE_NAMES.PERMISSION,
          object: perm,
          newData: perm
        },
        user
      );
    }

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
    { user, models, subdomain }: IContext
  ) {
    const permissions = await models.Permissions.find({ _id: { $in: ids } });
    const result = await models.Permissions.removePermission(ids);

    for (const perm of permissions) {
      await putDeleteLog(
        models,
        subdomain,
        { type: MODULE_NAMES.PERMISSION, object: perm },
        user
      );
    }

    await resetPermissionsCache(models);

    return result;
  }
};

const usersGroupMutations = {
  /**
   * Create new group
   * @param {String} doc.name
   * @param {String} doc.description
   * @return {Promise} newly created group object
   */
  async usersGroupsAdd(
    _root,
    { memberIds, ...doc }: IUserGroup & { memberIds?: string[] },
    { user, models, subdomain }: IContext
  ) {
    // users before updating
    const oldUsers = await models.Users.find({
      _id: { $in: memberIds || [] }
    }).lean();

    const group = await models.UsersGroups.createGroup(doc, memberIds);

    await putCreateLog(
      models,
      subdomain,
      {
        type: MODULE_NAMES.USER_GROUP,
        object: group,
        newData: doc,
        description: `"${group.name}" has been created`
      },
      user
    );

    for (const oldUser of oldUsers) {
      const updatedDocument = {
        groupIds: [...(oldUser.groupIds || []), group._id]
      };

      await putUpdateLog(
        models,
        subdomain,
        {
          type: MODULE_NAMES.USER,
          object: oldUser,
          newData: updatedDocument,
          description: `User "${oldUser.email}" has been added to group ${group.name}`,
          updatedDocument
        },
        user
      );
    }

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
    { user, models, subdomain }: IContext
  ) {
    const group = await models.UsersGroups.getGroup(_id);

    const oldUsers = await models.Users.find({
      groupIds: { $in: [_id] }
    }).lean();

    const result = await models.UsersGroups.updateGroup(_id, doc, memberIds);

    // don't write unnecessary log when nothing is changed
    if (group.name !== doc.name) {
      await putUpdateLog(
        models,
        subdomain,
        {
          type: MODULE_NAMES.USER_GROUP,
          object: group,
          newData: doc,
          description: `"${group.name}" has been edited`
        },
        user
      );
    }

    await writeUserLog(models, subdomain, {
      currentUser: user,
      memberIds,
      oldUsers,
      group
    });

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
    { user, models, subdomain }: IContext
  ) {
    const group = await models.UsersGroups.getGroup(_id);

    const members = await models.Users.find({
      groupIds: { $in: [group._id] }
    }).lean();

    const result = await models.UsersGroups.removeGroup(_id);

    await putDeleteLog(
      models,
      subdomain,
      {
        type: MODULE_NAMES.USER_GROUP,
        object: group,
        description: `"${group.name}" has been removed`
      },
      user
    );

    for (const member of members) {
      const groupIds = member.groupIds
        ? member.groupIds.filter(id => id !== group._id)
        : [];

      await putUpdateLog(
        models,
        subdomain,
        {
          type: MODULE_NAMES.USER,
          object: { _id: member._id, groupIds: member.groupIds },
          newData: { groupIds },
          updatedDocument: { groupIds },
          description: `User ${member.email} has been removed from group ${group.name}`
        },
        user
      );
    }

    await resetPermissionsCache(models);

    return result;
  },

  async usersGroupsCopy(
    _root,
    { _id, memberIds }: { _id: string; memberIds: string[] },
    { user, models, subdomain }: IContext
  ) {
    const group = await models.UsersGroups.getGroup(_id);

    const clone = await models.UsersGroups.copyGroup(group._id, memberIds);

    await putCreateLog(
      models,
      subdomain,
      {
        type: MODULE_NAMES.USER_GROUP,
        object: clone,
        newData: { name: clone.name, description: clone.description },
        description: `"${group.name}" has been copied`
      },
      user
    );

    return clone;
  },

  async permissionsFix(_root, _params, { models }: IContext) {
    const result = await fixPermissions(models);

    await resetPermissionsCache(models);

    return result;
  }
};

moduleCheckPermission(permissionMutations, 'managePermissions');
moduleCheckPermission(usersGroupMutations, 'manageUsersGroups');

export { permissionMutations, usersGroupMutations };
