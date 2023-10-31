import { Document, Schema, Model, Connection, Types } from 'mongoose';
import { IModels } from '../index';
import * as _ from 'lodash';
import { PermissionGroupDocument } from './permissionGroup';

const { ObjectId } = Types;

export interface IPermissionGroupUser {
  permissionGroupId: string;
  userId: string;
}

export type PermissionGroupUserDocument = IPermissionGroupUser & Document;

export interface IPermissionGroupUserModel
  extends Model<PermissionGroupUserDocument> {
  getUserIdsOfPermissionGroup(permissionGroupId: string): Promise<string[]>;
  getPermissionGroupsOfUser(userId: string): Promise<PermissionGroupDocument[]>;

  addUsersToPermissionGroups(
    userIds: string[],
    permissionGroupIds: string[]
  ): Promise<void>;
  removeUsersFromPermissionGroups(
    userIds: string[],
    permissionGroupIds: string[]
  ): Promise<void>;

  setUsers(
    permissionGroupId: string,
    cpUserIds: string[] | undefined | null
  ): Promise<boolean>;
}

export const permissionGroupUserSchema = new Schema<
  PermissionGroupUserDocument
>({
  permissionGroupId: { type: Types.ObjectId, required: true },
  userId: { type: String, required: true }
});

permissionGroupUserSchema.index(
  { permissionGroupId: 1, userId: 1 },
  { unique: true }
);
permissionGroupUserSchema.index({ userId: 1 });

export const generatePermissionGroupUserModel = (
  subdomain: string,
  con: Connection,
  models: IModels
): void => {
  class PermissionGroupUserModelStatics {
    public static async getUserIdsOfPermissionGroup(
      permissionGroupId: string
    ): Promise<string[]> {
      const rels = await models.PermissionGroupUser.find({
        permissionGroupId: ObjectId(permissionGroupId)
      });
      return (rels || []).map(rel => rel.userId);
    }
    public static async getGroupsOfUser(
      userId: string
    ): Promise<PermissionGroupDocument[]> {
      const rels = await models.PermissionGroupUser.find({ userId });
      const permissionGroupIds = rels.map(
        ({ permissionGroupId }) => permissionGroupId
      );
      const permissionGroups = await models.PermissionGroup.find({
        _id: { $in: permissionGroupIds }
      });
      return permissionGroups;
    }
    public static async addUsersToPermissionGroups(
      userIds: string[],
      permissionGroupIds: string[]
    ): Promise<void> {
      const rels: IPermissionGroupUser[] = [];

      for (const userId of userIds) {
        for (const permissionGroupId of permissionGroupIds) {
          rels.push({
            userId,
            permissionGroupId
          });
        }
      }

      await models.PermissionGroupUser.insertMany(rels);
    }
    public static async removeUsersFromPermissionGroups(
      userIds: string[],
      permissionGroupIds: string[]
    ): Promise<void> {
      await models.PermissionGroupUser.deleteMany({
        userId: { $in: userIds },
        permissionGroupId: { $in: permissionGroupIds.map(ObjectId) }
      });
    }

    public static async setUsers(
      permissionGroupId: string,
      cpUserIds: string[] | undefined | null
    ): Promise<boolean> {
      // await models.PermissionGroupUser.deleteMany({
      //   userId: { $nin: cpUserIds || [] },
      //   permissionGroupId,
      // });

      const ops: any[] = (cpUserIds || []).map(userId => ({
        updateOne: {
          filter: { userId, permissionGroupId },
          update: { $set: { userId, permissionGroupId } },
          upsert: true
        }
      }));

      ops.push({
        deleteMany: {
          filter: {
            userId: { $nin: cpUserIds || [] },
            permissionGroupId
          }
        }
      });

      await models.PermissionGroupUser.bulkWrite(ops);

      return true;
    }
  }

  permissionGroupUserSchema.loadClass(PermissionGroupUserModelStatics);
  models.PermissionGroupUser = con.model<
    PermissionGroupUserDocument,
    IPermissionGroupUserModel
  >('forum_permission_group_users', permissionGroupUserSchema);
};
