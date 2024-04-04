import { Document, Schema, Model, Connection, Types } from 'mongoose';
import { IModels } from '../index';
import * as _ from 'lodash';
import { Permissions } from '../../../consts';

const { ObjectId } = Types;

export interface IPermissionGroupCategoryPermit {
  _id?: any;
  categoryId: string;
  permissionGroupId: string;
  permission: Permissions;
}

export type PermissionGroupCategoryPermitDocument = IPermissionGroupCategoryPermit &
  Document;

export interface IPermissionGroupCategoryPermitModel
  extends Model<PermissionGroupCategoryPermitDocument> {
  userPermittedCategoryIds(userId: string): Promise<Types.ObjectId[]>;
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
  isUserPermitted(
    categoryId: string,
    permission: Permissions,
    cpUserId?: string
  ): Promise<boolean>;
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

    public static async isUserPermitted(
      categoryId: string,
      permission: Permissions,
      cpUserId?: string
    ): Promise<boolean> {
      if (!cpUserId) return false;

      const usersPermissionGroups = await models.PermissionGroupUser.find({
        userId: cpUserId
      }).lean();

      if (!usersPermissionGroups?.length) return false;

      const count = await models.PermissionGroupCategoryPermit.countDocuments({
        categoryId,
        permission,
        permissionGroupId: {
          $in: usersPermissionGroups.map(p => p.permissionGroupId)
        }
      });

      return count > 0;

      /*
      const result = await models.PermissionGroupUser.aggregate()
        .match({ userId: cpUserId })
        .lookup({
          from: models.PermissionGroupCategoryPermit.collection.collectionName,
          localField: 'permissionGroupId',
          foreignField: 'permissionGroupId',
          as: 'permits'
        })
        .match({
          permits: {
            $elemMatch: {
              permission: permission,
              categoryId: ObjectId(categoryId.toString())
            }
          }
        })
        .limit(1)
        .project({ _id: 1 });

      return result.length > 0;
      */
    }

    public static async userPermittedCategoryIds(
      userId: string
    ): Promise<Types.ObjectId[]> {
      const rels = await models.PermissionGroupUser.find({ userId });
      const permissionGroupIds = rels.map(rel => rel.permissionGroupId);

      if (!permissionGroupIds?.length) return [];

      const permits = await models.PermissionGroupCategoryPermit.find({
        permissionGroupId: { $in: permissionGroupIds },
        permission: 'WRITE_POST'
      });

      return permits.map(p => p.categoryId);
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
