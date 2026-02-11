// packages/core-api/src/db/models/PermissionGroups.ts

import { Model } from 'mongoose';
import { IModels } from '~/connectionResolvers';
import { permissionGroupSchema } from '../definitions/permissions';

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

      // Remove from all users
      await models.Users.updateMany(
        { permissionGroupIds: id },
        { $pull: { permissionGroupIds: id } },
      );

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
  }

  permissionGroupSchema.loadClass(PermissionGroup);
  return permissionGroupSchema;
};
