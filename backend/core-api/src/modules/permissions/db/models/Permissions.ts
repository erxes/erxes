// packages/core-api/src/db/models/PermissionGroups.ts

import { Model } from 'mongoose';
import { IModels } from '~/connectionResolvers';
import { permissionGroupSchema } from '../definitions/permissions';
import { getPluginTemplates } from '../../utils';

import {
  IPermissionGroup,
  IPermissionGroupDocument,
} from 'erxes-api-shared/core-types';

export interface IPermissionGroupModel extends Model<IPermissionGroupDocument> {
  createGroup(doc: IPermissionGroup): Promise<IPermissionGroupDocument>;
  updateGroup(
    id: string,
    doc: IPermissionGroup,
  ): Promise<IPermissionGroupDocument>;
  removeGroup(id: string): Promise<{ success: boolean }>;
  getGroup(id: string): Promise<IPermissionGroupDocument>;
  resetGroupToTemplate(id: string): Promise<IPermissionGroupDocument>;
  moveMembers(
    fromGroupId: string,
    toGroupId: string,
    options: { userIds?: string[]; excludeUserIds?: string[] },
  ): Promise<string[]>;
}

export const loadPermissionGroupClass = (models: IModels) => {
  class PermissionGroup {
    public static async createGroup(doc: IPermissionGroup) {
      return models.PermissionGroups.create(doc);
    }

    public static async updateGroup(id: string, doc: IPermissionGroup) {
      await models.PermissionGroups.updateOne({ _id: id }, { $set: doc });
      return models.PermissionGroups.findOne({ _id: id });
    }

    public static async removeGroup(id: string) {
      const group = await models.PermissionGroups.findOne({ _id: id });
      if (!group) {
        throw new Error('Permission group not found');
      }

      if ((await models.PermissionGroups.countDocuments({})) <= 1) {
        throw new Error('The last permission group cannot be removed');
      }

      const memberCount = await models.Users.countDocuments({
        permissionGroupIds: id,
      });
      if (memberCount > 0) {
        throw new Error(
          `This permission group is assigned to ${memberCount} user(s). Move them to another group before removing it`,
        );
      }

      await models.PermissionGroups.deleteOne({ _id: id });
      return { success: true };
    }

    public static async moveMembers(
      fromGroupId: string,
      toGroupId: string,
      {
        userIds,
        excludeUserIds,
      }: { userIds?: string[]; excludeUserIds?: string[] },
    ) {
      if (fromGroupId === toGroupId) {
        throw new Error('Choose a different permission group');
      }

      await models.PermissionGroups.getGroup(fromGroupId);
      await models.PermissionGroups.getGroup(toGroupId);

      const selector: Record<string, unknown> = {
        permissionGroupIds: fromGroupId,
      };

      if (userIds?.length) {
        selector._id = { $in: userIds };
      } else if (excludeUserIds?.length) {
        selector._id = { $nin: excludeUserIds };
      }

      const users = await models.Users.find(selector, { _id: 1 }).lean();
      const movedUserIds = users.map((user) => String(user._id));

      if (!movedUserIds.length) {
        return movedUserIds;
      }

      await models.Users.updateMany(
        { _id: { $in: movedUserIds } },
        { $addToSet: { permissionGroupIds: toGroupId } },
      );
      await models.Users.updateMany(
        { _id: { $in: movedUserIds } },
        { $pull: { permissionGroupIds: fromGroupId } },
      );

      return movedUserIds;
    }

    public static async getGroup(id: string) {
      const group = await models.PermissionGroups.findOne({ _id: id });
      if (!group) {
        throw new Error('Permission group not found');
      }
      return group;
    }

    public static async resetGroupToTemplate(id: string) {
      const group = await models.PermissionGroups.getGroup(id);

      if (!group.templateId || !group.plugin) {
        throw new Error('Permission group was not created from a template');
      }

      const template = (await getPluginTemplates(group.plugin)).find(
        ({ id: templateId }) => templateId === group.templateId,
      );

      if (!template) {
        throw new Error('Permission group template no longer exists');
      }

      await models.PermissionGroups.updateOne(
        { _id: id },
        {
          $set: {
            name: template.name,
            description: template.description,
            permissions: template.permissions,
          },
        },
      );

      return models.PermissionGroups.getGroup(id);
    }
  }

  permissionGroupSchema.loadClass(PermissionGroup);
  return permissionGroupSchema;
};
