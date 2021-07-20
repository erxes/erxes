import * as _ from 'underscore';
import { Permissions, UsersGroups } from '../../../db/models';
import {
  IPermissionParams,
  IUserGroup,
  IUserGroupDocument
} from '../../../db/models/definitions/permissions';
import { IUserDocument } from '../../../db/models/definitions/users';
import { MODULE_NAMES } from '../../constants';
import { putCreateLog, putDeleteLog, putUpdateLog } from '../../logUtils';
import { fixPermissions, resetPermissionsCache } from '../../permissions/utils';
import { moduleCheckPermission } from '../../permissions/wrappers';
import { IContext } from '../../types';
import { getDocument, getDocumentList } from './cacheUtils';

interface IParams {
  memberIds?: string[];
  oldUsers: IUserDocument[];
  group: IUserGroupDocument;
  currentUser: IUserDocument;
}

const writeUserLog = async (params: IParams) => {
  const { memberIds = [], oldUsers = [], group, currentUser } = params;

  for (const oldUser of oldUsers) {
    const exists = memberIds.find(id => id === oldUser._id);

    if (!exists) {
      const groupIds = oldUser.groupIds
        ? oldUser.groupIds.filter(item => item !== group._id)
        : [];
      // user has been removed from the group
      await putUpdateLog(
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
      const addedUser = await getDocument('users', { _id: memberId });

      if (addedUser) {
        // previous data was like this
        const groupIds = (addedUser.groupIds || []).filter(
          groupId => groupId !== group._id
        );

        await putUpdateLog(
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
  async permissionsAdd(_root, doc: IPermissionParams, { user }: IContext) {
    const result = await Permissions.createPermission(doc);

    for (const perm of result) {
      await putCreateLog(
        {
          type: MODULE_NAMES.PERMISSION,
          object: perm,
          newData: perm
        },
        user
      );
    }

    await resetPermissionsCache();

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
    { user }: IContext
  ) {
    const permissions = await Permissions.find({ _id: { $in: ids } });
    const result = await Permissions.removePermission(ids);

    for (const perm of permissions) {
      await putDeleteLog({ type: MODULE_NAMES.PERMISSION, object: perm }, user);
    }

    await resetPermissionsCache();

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
    { user }: IContext
  ) {
    // users before updating
    const oldUsers = await getDocumentList('users', {
      _id: { $in: memberIds || [] }
    });

    const group = await UsersGroups.createGroup(doc, memberIds);

    await putCreateLog(
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

    await resetPermissionsCache();

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
    { user }: IContext
  ) {
    const group = await UsersGroups.getGroup(_id);
    const oldUsers = await getDocumentList('users', {
      groupIds: { $in: [_id] }
    });
    const result = await UsersGroups.updateGroup(_id, doc, memberIds);

    // don't write unnecessary log when nothing is changed
    if (group.name !== doc.name) {
      await putUpdateLog(
        {
          type: MODULE_NAMES.USER_GROUP,
          object: group,
          newData: doc,
          description: `"${group.name}" has been edited`
        },
        user
      );
    }

    await writeUserLog({
      currentUser: user,
      memberIds,
      oldUsers,
      group
    });

    await resetPermissionsCache();

    return result;
  },

  /**
   * Remove group
   * @param {String} _id
   * @return {Promise}
   */
  async usersGroupsRemove(_root, { _id }: { _id: string }, { user }: IContext) {
    const group = await UsersGroups.getGroup(_id);
    const members = await getDocumentList('users', {
      groupIds: { $in: [group._id] }
    });
    const result = await UsersGroups.removeGroup(_id);

    await putDeleteLog(
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

    await resetPermissionsCache();

    return result;
  },

  async usersGroupsCopy(
    _root,
    { _id, memberIds }: { _id: string; memberIds: string[] },
    { user }: IContext
  ) {
    const group = await UsersGroups.getGroup(_id);

    const clone = await UsersGroups.copyGroup(group._id, memberIds);

    await putCreateLog(
      {
        type: 'userGroup',
        object: clone,
        newData: { name: clone.name, description: clone.description },
        description: `"${group.name}" has been copied`
      },
      user
    );

    return clone;
  },

  async permissionsFix(_root, _params) {
    const result = await fixPermissions();

    await resetPermissionsCache();

    return result;
  }
};

moduleCheckPermission(permissionMutations, 'managePermissions');
moduleCheckPermission(usersGroupMutations, 'manageUsersGroups');

export { permissionMutations, usersGroupMutations };
