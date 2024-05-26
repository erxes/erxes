import { Model } from 'mongoose';
import { IModels } from '../connectionResolver';
import {
  IPermission,
  IPermissionDocument,
  permissionSchema,
} from './definitions/permission';

export interface IPermissionModel extends Model<IPermissionDocument> {
  getPermission(selector: any): Promise<IPermissionDocument>;
  createPermission(doc: IPermission): Promise<IPermissionDocument>;
  updatePermission(_id: string, doc: IPermission): Promise<IPermissionDocument>;
  removePermissions(_ids: string[]): Promise<{ n: number; ok: number }>;
}

export const loadPermissionClass = (models: IModels, subdomain: string) => {
  class Permission {
    /**
     *
     * Get Permissioning Cagegory
     */

    public static async getPermission(selector: any) {
      const permissioning = await models.Permissions.findOne(selector).lean();

      if (!permissioning) {
        throw new Error('Permissioning not found');
      }

      return permissioning;
    }

    /**
     * Create a permissioning
     */
    public static async createPermission(doc: IPermission) {
      return models.Permissions.create({ ...doc, createdAt: new Date() });
    }

    /**
     * Update Permissioning
     */
    public static async updatePermission(_id: string, doc: IPermission) {
      await models.Permissions.getPermission({ _id });

      await models.Permissions.updateOne({ _id }, { $set: doc });

      return await models.Permissions.findOne({ _id }).lean();
    }

    /**
     * Remove permissionings
     */
    public static async removePermissions(ids: string[]) {
      await models.Permissions.deleteMany({ _id: { $in: ids } });

      return 'success';
    }
  }

  permissionSchema.loadClass(Permission);

  return permissionSchema;
};

