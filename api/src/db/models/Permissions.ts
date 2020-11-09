import { Model, model } from 'mongoose';
import { Users } from '.';
import { actionsMap, IActionsMap } from '../../data/permissions/utils';
import {
  IPermission,
  IPermissionDocument,
  IPermissionParams,
  IUserGroup,
  IUserGroupDocument,
  permissionSchema,
  userGroupSchema
} from './definitions/permissions';

export interface IPermissionModel extends Model<IPermissionDocument> {
  createPermission(doc: IPermissionParams): Promise<IPermissionDocument[]>;
  removePermission(ids: string[]): Promise<IPermissionDocument>;
  getPermission(id: string): Promise<IPermissionDocument>;
}

export interface IUserGroupModel extends Model<IUserGroupDocument> {
  getGroup(_id: string): Promise<IUserGroupDocument>;
  createGroup(
    doc: IUserGroup,
    memberIds?: string[]
  ): Promise<IUserGroupDocument>;
  updateGroup(
    _id: string,
    doc: IUserGroup,
    memberIds?: string[]
  ): Promise<IUserGroupDocument>;
  removeGroup(_id: string): Promise<IUserGroupDocument>;
  copyGroup(
    sourceGroupId: string,
    memberIds?: string[]
  ): Promise<IUserGroupDocument>;
}

export const permissionLoadClass = () => {
  class Permission {
    /**
     * Create a permission
     * @param  {Object} doc object
     * @return {Promise} Newly created permission object
     */
    public static async createPermission(doc: IPermissionParams) {
      const permissions: IPermissionDocument[] = [];

      for (const action of doc.actions) {
        if (!actionsMap[action]) {
          throw new Error('Invalid data');
        }
      }

      let filter = {};

      let actionObj: IActionsMap = {};

      for (const action of doc.actions) {
        const entry: IPermission = {
          action,
          module: doc.module,
          allowed: doc.allowed || false,
          requiredActions: []
        };

        actionObj = actionsMap[action];

        if (actionObj.use) {
          entry.requiredActions = actionObj.use;
        }

        if (doc.userIds) {
          for (const userId of doc.userIds) {
            filter = { action, userId };

            const entryObj = await Permissions.findOne(filter);

            if (!entryObj) {
              const newEntry = await Permissions.create({ ...entry, userId });
              permissions.push(newEntry);
            }
          }
        }

        if (doc.groupIds) {
          for (const groupId of doc.groupIds) {
            filter = { action, groupId };

            const entryObj = await Permissions.findOne(filter);

            if (!entryObj) {
              const newEntry = await Permissions.create({ ...entry, groupId });
              permissions.push(newEntry);
            }
          }
        }
      }

      return permissions;
    }

    /**
     * Delete permission
     * @param  {[string]} ids
     * @return {Promise}
     */
    public static async removePermission(ids: string[]) {
      const count = await Permissions.find({
        _id: { $in: ids }
      }).countDocuments();

      if (count !== ids.length) {
        throw new Error('Permission not found');
      }

      return Permissions.deleteMany({ _id: { $in: ids } });
    }

    public static async getPermission(id: string) {
      const permission = await Permissions.findOne({ _id: id });

      if (!permission) {
        throw new Error('Permission not found');
      }

      return permission;
    }
  }

  permissionSchema.loadClass(Permission);

  return permissionSchema;
};

export const userGroupLoadClass = () => {
  class UserGroup {
    public static async getGroup(_id: string) {
      const userGroup = await UsersGroups.findOne({ _id });

      if (!userGroup) {
        throw new Error('User group not found');
      }

      return userGroup;
    }

    /**
     * Create a group
     */
    public static async createGroup(doc: IUserGroup, memberIds?: string[]) {
      const group = await UsersGroups.create(doc);

      await Users.updateMany(
        { _id: { $in: memberIds || [] } },
        { $push: { groupIds: group._id } }
      );

      return group;
    }

    /**
     * Update Group
     */
    public static async updateGroup(
      _id: string,
      doc: IUserGroup,
      memberIds?: string[]
    ) {
      // remove groupId from old members
      await Users.updateMany(
        { groupIds: { $in: [_id] } },
        { $pull: { groupIds: { $in: [_id] } } }
      );

      await UsersGroups.updateOne({ _id }, { $set: doc });

      // add groupId to new members
      await Users.updateMany(
        { _id: { $in: memberIds || [] } },
        { $push: { groupIds: _id } }
      );

      return UsersGroups.findOne({ _id });
    }

    /**
     * Remove Group
     * @param  {String} _id
     * @return {Promise}
     */
    public static async removeGroup(_id: string) {
      const groupObj = await UsersGroups.findOne({ _id });

      if (!groupObj) {
        throw new Error(`Group not found with id ${_id}`);
      }

      await Users.updateMany(
        { groupIds: { $in: [_id] } },
        { $pull: { groupIds: { $in: [_id] } } }
      );

      await Permissions.remove({ groupId: groupObj._id });

      return groupObj.remove();
    }

    public static async copyGroup(sourceGroupId: string, memberIds?: string[]) {
      const sourceGroup = await UsersGroups.getGroup(sourceGroupId);

      const nameCount = await UsersGroups.countDocuments({
        name: new RegExp(`${sourceGroup.name}`, 'i')
      });

      const clone = await UsersGroups.createGroup(
        {
          name: `${sourceGroup.name}-copied-${nameCount}`,
          description: `${sourceGroup.description}-copied`
        },
        memberIds
      );

      const permissions = await Permissions.find({ groupId: sourceGroupId });

      for (const perm of permissions) {
        await Permissions.create({
          groupId: clone._id,
          action: perm.action,
          module: perm.module,
          requiredActions: perm.requiredActions,
          allowed: perm.allowed
        });
      }

      return clone;
    }
  }

  userGroupSchema.loadClass(UserGroup);

  return userGroupSchema;
};

permissionLoadClass();
userGroupLoadClass();

// tslint:disable-next-line
export const Permissions = model<IPermissionDocument, IPermissionModel>(
  'permissions',
  permissionSchema
);

// tslint:disable-next-line
export const UsersGroups = model<IUserGroupDocument, IUserGroupModel>(
  'user_groups',
  userGroupSchema
);
