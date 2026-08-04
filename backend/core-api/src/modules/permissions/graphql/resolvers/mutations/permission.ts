import { IContext } from '~/connectionResolvers';
import { IPermissionInput } from 'erxes-api-shared/core-types';
import { generateUserUpdateActivityLogs } from '~/modules/organization/team-member/meta/activity-log';
import { clearGroupActionsCache } from 'erxes-api-shared/core-modules';

export const permissionMutations = {
  async permissionGroupAdd(
    _root: any,
    {
      name,
      description,
      permissions,
    }: {
      name: string;
      description?: string;
      permissions: IPermissionInput[];
    },
    { models, checkPermission }: IContext,
  ) {
    await checkPermission('permissionsManage');

    return models.PermissionGroups.create({
      name,
      description,
      permissions,
    });
  },

  // Update custom permission group
  async permissionGroupEdit(
    _root: any,
    {
      _id,
      name,
      description,
      permissions,
    }: {
      _id: string;
      name?: string;
      description?: string;
      permissions?: IPermissionInput[];
    },
    { models, checkPermission, subdomain }: IContext,
  ) {
    await checkPermission('permissionsManage');

    const group = await models.PermissionGroups.findOne({ _id });
    if (!group) throw new Error('Permission group not found');

    const update: any = {};
    if (name !== undefined) update.name = name;
    if (description !== undefined) update.description = description;
    if (permissions !== undefined) update.permissions = permissions;

    await models.PermissionGroups.updateOne({ _id }, { $set: update });

    await clearGroupActionsCache({ subdomain, groupId: _id });

    return models.PermissionGroups.findOne({ _id });
  },

  // Remove custom permission group
  async permissionGroupRemove(
    _root: any,
    { _id }: { _id: string },
    { models, checkPermission, subdomain }: IContext,
  ) {
    await checkPermission('permissionsManage');

    const group = await models.PermissionGroups.findOne({ _id });
    if (!group) throw new Error('Permission group not found');

    await clearGroupActionsCache({ subdomain, groupId: _id });

    // Remove from all users
    await models.Users.updateMany(
      { permissionGroupIds: _id },
      { $pull: { permissionGroupIds: _id } },
    );

    await models.PermissionGroups.deleteOne({ _id });

    return { success: true };
  },

  // Assign permission groups to user
  async userUpdatePermissionGroups(
    _root: any,
    { userId, groupIds }: { userId: string; groupIds: string[] },
    { models, checkPermission }: IContext,
  ) {
    await checkPermission('permissionsManage');

    const user = await models.Users.findOne({ _id: userId });
    if (!user) throw new Error('User not found');

    await models.Users.updateUser(userId, { permissionGroupIds: groupIds });

    await clearGroupActionsCache({ userId });

    return models.Users.findOne({ _id: userId });
  },

  // Assign permission groups to many users at once.
  // Default groups (id contains ':') replace any existing group with the
  // same plugin prefix; custom groups (Mongo ObjectId, no ':') are added.
  async usersUpdatePermissionGroups(
    _root: any,
    { userIds, groupIds }: { userIds: string[]; groupIds: string[] },
    { models, checkPermission }: IContext,
  ) {
    await checkPermission('permissionsManage');

    const newDefaultPrefixes = groupIds
      .filter((id) => id.includes(':'))
      .map((id) => id.split(':')[0]);

    const users = await models.Users.find({
      _id: { $in: userIds },
    }).lean();

    const foundIds = new Set(users.map((u: any) => u._id));
    const missing = userIds.filter((id) => !foundIds.has(id));
    if (missing.length) {
      throw new Error(`Users not found: ${missing.join(', ')}`);
    }

    for (const user of users) {
      const existing: string[] = user.permissionGroupIds || [];

      const kept = existing.filter((id) => {
        if (!id.includes(':')) return true;
        const prefix = id.split(':')[0];
        return !newDefaultPrefixes.includes(prefix);
      });

      const merged = Array.from(new Set([...kept, ...groupIds]));

      await models.Users.updateUser(user._id, {
        permissionGroupIds: merged,
      });

      await clearGroupActionsCache({ userId: user._id });
    }

    return { success: true, count: users.length };
  },

  // Add custom permission to user
  async userAddCustomPermission(
    _root: any,
    { userId, permission }: { userId: string; permission: IPermissionInput },
    { subdomain, models, eventHandlers, checkPermission }: IContext,
  ) {
    await checkPermission('permissionsManage');

    const user = await models.Users.findOne({ _id: userId });
    if (!user) throw new Error('User not found');

    const { sendDbEventLog, createActivityLog } = eventHandlers('core')(
      'organization',
      'users',
    );
    // Remove existing permission for same module (replace)
    await models.Users.updateOne(
      { _id: userId },
      { $pull: { customPermissions: { module: permission.module } } },
    );

    // Add new permission

    await models.Users.updateOne(
      { _id: userId },
      { $push: { customPermissions: permission } },
    );

    const updatedUser = await models.Users.findOne({ _id: userId });
    if (updatedUser) {
      sendDbEventLog({
        action: 'update',
        docId: updatedUser._id,
        currentDocument: updatedUser.toObject(),
        prevDocument: user.toObject(),
      });

      // Generate activity logs for changed activity fields
      generateUserUpdateActivityLogs(
        { models, subdomain },
        user,
        updatedUser,
        createActivityLog,
      );
    }
    await clearGroupActionsCache({ userId });
    return updatedUser;
  },

  // Remove custom permission from user
  async userRemoveCustomPermission(
    _root: any,
    { userId, module }: { userId: string; module: string },
    { models, subdomain, eventHandlers, checkPermission }: IContext,
  ) {
    await checkPermission('permissionsManage');

    const user = await models.Users.findOne({ _id: userId });
    if (!user) throw new Error('User not found');
    const { sendDbEventLog, createActivityLog } = eventHandlers('core')(
      'organization',
      'users',
    );
    await models.Users.updateOne(
      { _id: userId },
      { $pull: { customPermissions: { module } } },
    );

    const updatedUser = await models.Users.findOne({ _id: userId });

    if (updatedUser) {
      sendDbEventLog({
        action: 'update',
        docId: updatedUser._id,
        currentDocument: updatedUser.toObject(),
        prevDocument: user.toObject(),
      });

      // Generate activity logs for changed activity fields
      generateUserUpdateActivityLogs(
        { models, subdomain },
        user,
        updatedUser,
        createActivityLog,
      );
    }
    await clearGroupActionsCache({ userId });
    return updatedUser;
  },
};
