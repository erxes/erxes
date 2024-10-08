import { Model } from "mongoose";
import { IModels } from "../../connectionResolver";
import {
  getPermissionActionsMap,
  IActionsMap
} from "../../data/permissions/utils";
import {
  IPermission,
  IPermissionDocument,
  IPermissionParams,
  IUserGroup,
  IUserGroupDocument,
  permissionSchema,
  userGroupSchema
} from "./definitions/permissions";

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

export const loadPermissionClass = (models: IModels) => {
  class Permission {
    /**
     * Create a permission
     * @param  {Object} doc object
     * @return {Promise} Newly created permission object
     */
    public static async createPermission(doc: IPermissionParams) {
      const permissions: IPermissionDocument[] = [];

      let filter = {};

      let actionObj: IActionsMap = {};

      const actionsMap = await getPermissionActionsMap();

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

            const entryObj = await models.Permissions.findOne(filter);

            if (!entryObj) {
              const newEntry = await models.Permissions.create({
                ...entry,
                userId
              });
              permissions.push(newEntry);
            }
          }
        }

        if (doc.groupIds) {
          for (const groupId of doc.groupIds) {
            filter = { action, groupId };

            const entryObj = await models.Permissions.findOne(filter);

            if (!entryObj) {
              const newEntry = await models.Permissions.create({
                ...entry,
                groupId
              });
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
      const count = await models.Permissions.find({
        _id: { $in: ids }
      }).countDocuments();

      if (count !== ids.length) {
        throw new Error("Permission not found");
      }

      return models.Permissions.deleteMany({ _id: { $in: ids } });
    }

    public static async getPermission(id: string) {
      const permission = await models.Permissions.findOne({ _id: id });

      if (!permission) {
        throw new Error("Permission not found");
      }

      return permission;
    }
  }

  permissionSchema.loadClass(Permission);

  return permissionSchema;
};

export const loadUserGroupClass = (models: IModels) => {
  class UserGroup {
    public static async getGroup(_id: string) {
      const userGroup = await models.UsersGroups.findOne({ _id });

      if (!userGroup) {
        throw new Error("User group not found");
      }

      return userGroup;
    }

    /**
     * Create a group
     */
    public static async createGroup(doc: IUserGroup, memberIds?: string[]) {
      const group = await models.UsersGroups.create(doc);

      await models.Users.updateMany(
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
      await models.Users.updateMany(
        { groupIds: { $in: [_id] } },
        { $pull: { groupIds: { $in: [_id] } } }
      );

      await models.UsersGroups.updateOne({ _id }, { $set: doc });

      // add groupId to new members
      await models.Users.updateMany(
        { _id: { $in: memberIds || [] } },
        { $push: { groupIds: _id } }
      );

      return models.UsersGroups.findOne({ _id });
    }

    /**
     * Remove Group
     * @param  {String} _id
     * @return {Promise}
     */
    public static async removeGroup(_id: string) {
      const groupObj = await models.UsersGroups.findOneAndDelete({ _id });

      if (!groupObj) {
        throw new Error(`Group not found with id ${_id}`);
      }

      await models.Users.updateMany(
        { groupIds: { $in: [_id] } },
        { $pull: { groupIds: { $in: [_id] } } }
      );

      await models.Permissions.deleteMany({ groupId: groupObj._id });

      return groupObj;
    }

    public static async copyGroup(sourceGroupId: string, memberIds?: string[]) {
      const sourceGroup = await models.UsersGroups.getGroup(sourceGroupId);

      const nameCount = await models.UsersGroups.find({
        name: new RegExp(`${sourceGroup.name}`, "i")
      }).countDocuments();

      const clone = await models.UsersGroups.createGroup(
        {
          name: `${sourceGroup.name}-copied-${nameCount}`,
          description: `${sourceGroup.description}-copied`
        },
        memberIds
      );

      const permissions = await models.Permissions.find({
        groupId: sourceGroupId
      });

      for (const perm of permissions) {
        await models.Permissions.create({
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
