import { Document, Schema, Model, Connection, Types } from 'mongoose';
import { IModels } from '../index';
import * as _ from 'lodash';
import { Permissions } from '../../../consts';

const { ObjectId } = Types;

export interface IPermissionGroupCategoryPermit {
  _id?: any;
  categoryId: string;
  permissionGroupId: string;
  permission: string;
}

export type PermissionGroupCategoryPermitDocument = IPermissionGroupCategoryPermit &
  Document;

export interface IPermissionGroupCategoryPermitModel
  extends Model<PermissionGroupCategoryPermitDocument> {
  givePermission(
    permissionGroupId: string,
    categoryIds: string[],
    permission: Permissions
  ): Promise<void>;
  removePermission(
    permissionGroupId: string,
    categoryIds: string[],
    permission: Permissions
  ): Promise<void>;
}

export const PermissionGroupCategoryPermitSchema = new Schema<
  PermissionGroupCategoryPermitDocument
>({
  categoryId: { type: ObjectId, required: true },
  permissionGroupId: { type: ObjectId, required: true },
  permission: { type: String, required: true }
});

PermissionGroupCategoryPermitSchema.index(
  { permissionGroupId: 1, permission: 1, categoryId: 1 },
  { unique: true }
);
PermissionGroupCategoryPermitSchema.index({ categoryId: 1 });
PermissionGroupCategoryPermitSchema.index({ permission: 1 });

export const generatePermissionGroupCategoryPermitModel = (
  subdomain: string,
  con: Connection,
  models: IModels
): void => {
  class PermissionGroupCategoryPermitModel {
    public static async givePermission(
      permissionGroupId: string,
      categoryIds: string[],
      permission: Permissions
    ): Promise<void> {
      const toInsert: IPermissionGroupCategoryPermit[] = categoryIds.map(
        categoryId => ({ permissionGroupId, categoryId, permission })
      );
      await models.PermissionGroupCategoryPermit.insertMany(toInsert);
    }
    public static async removePermission(
      permissionGroupId: string,
      categoryIds: string[],
      permission: Permissions
    ): Promise<void> {
      await models.PermissionGroupCategoryPermit.deleteMany({
        permissionGroupId,
        categoryId: { $in: categoryIds },
        permission
      });
    }
  }

  PermissionGroupCategoryPermitSchema.loadClass(
    PermissionGroupCategoryPermitModel
  );
  models.PermissionGroupCategoryPermit = con.model<
    PermissionGroupCategoryPermitDocument,
    IPermissionGroupCategoryPermitModel
  >(
    'forum_permission_group_category_permit',
    PermissionGroupCategoryPermitSchema
  );
};
