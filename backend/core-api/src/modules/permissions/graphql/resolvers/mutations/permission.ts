import { IContext } from '~/connectionResolvers';
import { IPermissionInput } from 'erxes-api-shared/core-types';

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
    { models }: IContext,
  ) {
    console.log('log');
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
    { models }: IContext,
  ) {
    const group = await models.PermissionGroups.findOne({ _id });
    if (!group) throw new Error('Permission group not found');

    const update: any = {};
    if (name !== undefined) update.name = name;
    if (description !== undefined) update.description = description;
    if (permissions !== undefined) update.permissions = permissions;

    await models.PermissionGroups.updateOne({ _id }, { $set: update });

    return models.PermissionGroups.findOne({ _id });
  },

  // Remove custom permission group
  async permissionGroupRemove(
    _root: any,
    { _id }: { _id: string },
    { models }: IContext,
  ) {
    const group = await models.PermissionGroups.findOne({ _id });
    if (!group) throw new Error('Permission group not found');

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
    { models }: IContext,
  ) {
    const user = await models.Users.findOne({ _id: userId });
    if (!user) throw new Error('User not found');

    await models.Users.updateOne(
      { _id: userId },
      { $set: { permissionGroupIds: groupIds } },
    );

    return models.Users.findOne({ _id: userId });
  },

  // Add custom permission to user
  async userAddCustomPermission(
    _root: any,
    { userId, permission }: { userId: string; permission: IPermissionInput },
    { models }: IContext,
  ) {
    const user = await models.Users.findOne({ _id: userId });
    if (!user) throw new Error('User not found');

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

    return models.Users.findOne({ _id: userId });
  },

  // Remove custom permission from user
  async userRemoveCustomPermission(
    _root: any,
    { userId, module }: { userId: string; module: string },
    { models }: IContext,
  ) {
    const user = await models.Users.findOne({ _id: userId });
    if (!user) throw new Error('User not found');

    await models.Users.updateOne(
      { _id: userId },
      { $pull: { customPermissions: { module } } },
    );

    return models.Users.findOne({ _id: userId });
  },
};
