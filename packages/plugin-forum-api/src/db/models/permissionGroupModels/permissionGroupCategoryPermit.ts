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
    categoryId: string,
    permission: Permissions
  ): Promise<PermissionGroupCategoryPermitDocument>;
  removePermission(
    permissionGroupId: string,
    categoryId: string,
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
  { categoryId: 1, permissionGroupId: 1, permission: 1 },
  { unique: true }
);
PermissionGroupCategoryPermitSchema.index({ permissionGroupId: 1 });

export const generatePermissionGroupCategoryPermitModel = (
  subdomain: string,
  con: Connection,
  models: IModels
): void => {
  class PermissionGroupCategoryPermitModel {
    public static async givePermission(
      permissionGroupId: string,
      categoryId: string,
      permission: Permissions
    ): Promise<PermissionGroupCategoryPermitDocument> {
      const doc = new models.PermissionGroupCategoryPermit({
        permissionGroupId,
        categoryId,
        permission
      });
      await doc.save();
      return doc;
    }
    public static async removePermission(
      permissionGroupId: string,
      categoryId: string,
      permission: Permissions
    ): Promise<void> {
      await models.PermissionGroupCategoryPermit.deleteMany({
        permissionGroupId,
        categoryId,
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
