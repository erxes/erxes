import { Model, model } from 'mongoose';
import { actionsMap, IActionsMap } from '../../data/permissions/utils';
import {
  IPermission,
  IPermissionDocument,
  IPermissionParams,
  IUserGroup,
  IUserGroupDocument,
  permissionSchema,
  userGroupSchema,
} from './definitions/permissions';

export interface IPermissionModel extends Model<IPermissionDocument> {
  createPermission(doc: IPermissionParams): Promise<IPermissionDocument>;
  removePermission(ids: string[]): Promise<IPermissionDocument>;
}

export interface IUserGroupModel extends Model<IUserGroupDocument> {
  createGroup(doc: IUserGroup): Promise<IUserGroupDocument>;
  updateGroup(_id: string, doc: IUserGroup): Promise<IUserGroupDocument>;
  removeGroup(_id: string): Promise<IUserGroupDocument>;
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

      if (!doc.actions) {
        throw new Error('Actions not found');
      }

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
          requiredActions: [],
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
      const count = await Permissions.find({ _id: { $in: ids } }).count();

      if (count !== ids.length) {
        throw new Error('Permission not found');
      }

      return Permissions.remove({ _id: { $in: ids } });
    }
  }

  permissionSchema.loadClass(Permission);

  return permissionSchema;
};

export const userGroupLoadClass = () => {
  class UserGroup {
    /**
     * Create a group
     * @param  {Object} doc
     * @return {Promise} Newly created group object
     */
    public static async createGroup(doc: IUserGroup) {
      return UsersGroups.create(doc);
    }

    /**
     * Update Group
     * @param  {Object} doc
     * @return {Promise} updated group object
     */
    public static async updateGroup(_id: string, doc: IUserGroup) {
      await UsersGroups.update({ _id }, { $set: doc });

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

      return groupObj.remove();
    }
  }

  userGroupSchema.loadClass(UserGroup);

  return userGroupSchema;
};

permissionLoadClass();
userGroupLoadClass();

// tslint:disable-next-line
export const Permissions = model<IPermissionDocument, IPermissionModel>('permission', permissionSchema);

// tslint:disable-next-line
export const UsersGroups = model<IUserGroupDocument, IUserGroupModel>('user_groups', userGroupSchema);
