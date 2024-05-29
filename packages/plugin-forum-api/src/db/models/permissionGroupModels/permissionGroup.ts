import { Document, Schema, Model, Connection, Types } from 'mongoose';
import { IModels } from '../index';
import * as _ from 'lodash';

export interface IPermissionGroup {
  _id: any;
  name: string;
}

export type PermissionGroupDocument = IPermissionGroup & Document;

const OMIT_FROM_INPUT = ['_id'] as const;

export type PermissionGroupCreateInput = Omit<
  IPermissionGroup,
  typeof OMIT_FROM_INPUT[number]
>;
export type PermissionGroupPatchInput = PermissionGroupCreateInput;

export interface IPermissionGroupModel extends Model<PermissionGroupDocument> {
  findByIdOrThrow(_id: string): Promise<PermissionGroupDocument>;
  createPermissionGroup(
    input: PermissionGroupCreateInput
  ): Promise<PermissionGroupDocument>;
  patchPermissionGroup(
    _id: string,
    patch: PermissionGroupPatchInput
  ): Promise<PermissionGroupDocument>;
  deletePermissionGroup(_id: string): Promise<PermissionGroupDocument>;
}

export const permissionGroupSchema = new Schema<PermissionGroupDocument>({
  name: { type: String, required: true, unique: true }
});

export const generatePermissionGroupModel = (
  subdomain: string,
  con: Connection,
  models: IModels
): void => {
  class PermissionGroupModelStatics {
    public static async findByIdOrThrow(
      _id: string
    ): Promise<PermissionGroupDocument> {
      const doc = await models.PermissionGroup.findById(_id);
      if (!doc) {
        throw new Error(`Permission group with _id=${_id} doesn't exist`);
      }
      return doc;
    }

    public static async createPermissionGroup(
      input: PermissionGroupCreateInput
    ): Promise<PermissionGroupDocument> {
      return models.PermissionGroup.create(input);
    }

    public static async patchPermissionGroup(
      _id: string,
      patch: PermissionGroupPatchInput
    ): Promise<PermissionGroupDocument> {
      const doc = await models.PermissionGroup.findByIdAndUpdate(
        _id,
        { $set: patch },
        { new: true }
      );
      if (!doc) {
        throw new Error(`Permission group with _id=${_id} doesn't exist`);
      }
      return doc;
    }

    public static async deletePermissionGroup(
      _id: string
    ): Promise<PermissionGroupDocument> {
      const doc = await models.PermissionGroup.findByIdOrThrow(_id);

      const session = await con.startSession();
      session.startTransaction();
      try {
        await models.PermissionGroupCategoryPermit.deleteMany({
          permissionGroupId: _id
        });
        await models.PermissionGroupUser.deleteMany({ permissionGroupId: _id });
        await doc.remove();
        await session.commitTransaction();
      } catch (e) {
        await session.abortTransaction();
        throw e;
      }

      return doc;
    }
  }

  permissionGroupSchema.loadClass(PermissionGroupModelStatics);

  models.PermissionGroup = con.model<
    PermissionGroupDocument,
    IPermissionGroupModel
  >('forum_permission_groups', permissionGroupSchema);
};
