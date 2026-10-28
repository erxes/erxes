import { IContext } from '~/connectionResolvers';
import { IPermissionInput } from 'erxes-api-shared/core-types';
import { clearGroupActionsCache } from 'erxes-api-shared/core-modules';

export const permissionMutations = {
  async permissionGroupAdd(
    _root: undefined,
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

  async permissionGroupEdit(
    _root: undefined,
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

    const update: {
      name?: string;
      description?: string;
      permissions?: IPermissionInput[];
    } = {};
    if (name !== undefined) update.name = name;
    if (description !== undefined) update.description = description;
    if (permissions !== undefined) update.permissions = permissions;

    await models.PermissionGroups.updateOne({ _id }, { $set: update });

    await clearGroupActionsCache({ subdomain, groupId: _id });

    return models.PermissionGroups.findOne({ _id });
  },

  async permissionGroupRemove(
    _root: undefined,
    { _id }: { _id: string },
    { models, checkPermission }: IContext,
  ) {
    await checkPermission('permissionsManage');

    return models.PermissionGroups.removeGroup(_id);
  },

  async permissionGroupResetToTemplate(
    _root: undefined,
    { _id }: { _id: string },
    { models, checkPermission, subdomain }: IContext,
  ) {
    await checkPermission('permissionsManage');

    const group = await models.PermissionGroups.resetGroupToTemplate(_id);

    await clearGroupActionsCache({ subdomain, groupId: _id });

    return group;
  },
};
