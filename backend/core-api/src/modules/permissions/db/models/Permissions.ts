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

      const positions = await models.StructurePositions.countDocuments({
        groupIds: id,
      });
      if (positions > 0) {
        throw new Error(
          `${positions} position(s) grant this permission group. Remove it from those positions first`,
        );
      }

      await models.PermissionGroups.deleteOne({ _id: id });
      return { success: true };
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
