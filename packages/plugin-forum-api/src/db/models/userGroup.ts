import { Document, Schema, Model, Connection, Types } from 'mongoose';
import { IModels } from './index';
import * as _ from 'lodash';

/**
 * User Group
 */

export interface IUserGroup {
  _id: any;
  name: string;
}

export type UserGroupDocument = IUserGroup & Document;

export interface IUserGroupModel extends Model<UserGroupDocument> {
  findByIdOrThrow(_id: string): Promise<UserGroupDocument>;
}

export const userGroupSchema = new Schema<UserGroupDocument>({
  name: { type: String, required: true, unique: true }
});

/**
 * User Group Users
 */
export interface IUserGroupUsers {
  clientPortalUserGroupdId: string;
  clientPortalUserId: string;
}

export type UserGroupUsersDocument = IUserGroup & Document;

export interface IUserGroupUsersModel extends Model<UserGroupDocument> {}

export const userGroupUsersSchema = new Schema<UserGroupUsersDocument>(
  {
    userGroupId: { type: Types.ObjectId, required: true },
    cpUserId: { type: String, required: true }
  },
  {
    _id: false
  }
);

userGroupUsersSchema.index({ userGroupId: 1, cpUserId: 1 }, { unique: true });
userGroupUsersSchema.index({ cpUserId: 1 });

/**
 * Generate models
 */

export const generateClientPortalUserGroupModel = (
  subdomain: string,
  con: Connection,
  models: IModels
): void => {
  /**
   * User Group
   */
  class UserGroupModel {
    public static async findByIdOrThrow(
      _id: string
    ): Promise<UserGroupDocument> {
      const doc = await models.UserGroup.findById(_id);
      if (!doc) {
        throw new Error(`User group with _id=${_id} doesn't exist`);
      }
      return doc;
    }
  }

  userGroupSchema.loadClass(UserGroupModel);

  models.UserGroup = con.model<UserGroupDocument, IUserGroupModel>(
    'forum_user_groups',
    userGroupSchema
  );

  /**
   * User Group Users
   */

  class UserGroupUsersModel {}

  userGroupUsersSchema.loadClass(UserGroupUsersModel);
  models.UserGroupUsers = con.model<
    UserGroupUsersDocument,
    IUserGroupUsersModel
  >('forum_user_group_users', userGroupUsersSchema);
};
