import { IUserGroup, IUserGroupDocument } from 'erxes-api-shared/core-types';
import { Model } from 'mongoose';
import { EventDispatcherReturn } from 'erxes-api-shared/core-modules';
import { IModels } from '~/connectionResolvers';
import { userGroupSchema } from '../definitions/user-groups';

export interface IUserGroupModel extends Model<IUserGroupDocument> {
  getGroup(_id: string): Promise<IUserGroupDocument>;
  createGroup(
    doc: IUserGroup,
    memberIds?: string[],
  ): Promise<IUserGroupDocument>;
  updateGroup(
    _id: string,
    doc: IUserGroup,
    memberIds?: string[],
  ): Promise<IUserGroupDocument>;
  removeGroup(_id: string): Promise<IUserGroupDocument>;
  copyGroup(
    sourceGroupId: string,
    memberIds?: string[],
  ): Promise<IUserGroupDocument>;
}

export const loadUserGroupClass = (
  models: IModels,
  subdomain: string,
  { sendDbEventLog }: EventDispatcherReturn,
) => {
  class UserGroup {
    public static async getGroup(_id: string) {
      const userGroup = await models.UsersGroups.findOne({ _id });

      if (!userGroup) {
        throw new Error('User group not found');
      }

      return userGroup;
    }

    /**
     * Create a group
     */
    public static async createGroup(doc: IUserGroup, memberIds?: string[]) {
      const group = await models.UsersGroups.create(doc);
      sendDbEventLog({
        action: 'create',
        docId: group._id,
        currentDocument: group.toObject(),
      });

      await models.Users.updateMany(
        { _id: { $in: memberIds || [] } },
        { $push: { groupIds: group._id } },
      );

      return group;
    }

    /**
     * Update Group
     */
    public static async updateGroup(
      _id: string,
      doc: IUserGroup,
      memberIds?: string[],
    ) {
      const oldGroup = await models.UsersGroups.findOne({ _id });
      // remove groupId from old members
      await models.Users.updateMany(
        { groupIds: { $in: [_id] } },
        { $pull: { groupIds: { $in: [_id] } } },
      );

      await models.UsersGroups.updateOne({ _id }, { $set: doc });

      // add groupId to new members
      await models.Users.updateMany(
        { _id: { $in: memberIds || [] } },
        { $push: { groupIds: _id } },
      );

      const updatedGroup = await models.UsersGroups.findOne({ _id });
      if (updatedGroup && oldGroup) {
        sendDbEventLog({
          action: 'update',
          docId: updatedGroup._id,
          currentDocument: updatedGroup.toObject(),
          prevDocument: oldGroup.toObject(),
        });
      }
      return updatedGroup;
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

      sendDbEventLog({
        action: 'delete',
        docId: groupObj._id,
      });

      await models.Users.updateMany(
        { groupIds: { $in: [_id] } },
        { $pull: { groupIds: { $in: [_id] } } },
      );

      await models.Permissions.deleteMany({ groupId: groupObj._id });

      return groupObj;
    }

    public static async copyGroup(sourceGroupId: string, memberIds?: string[]) {
      const sourceGroup = await models.UsersGroups.getGroup(sourceGroupId);

      const nameCount = await models.UsersGroups.find({
        name: new RegExp(`${sourceGroup.name}`, 'i'),
      }).countDocuments();

      const clone = await models.UsersGroups.createGroup(
        {
          name: `${sourceGroup.name}-copied-${nameCount}`,
          description: `${sourceGroup.description}-copied`,
        },
        memberIds,
      );

      const permissions = await models.Permissions.find({
        groupId: sourceGroupId,
      });

      for (const perm of permissions) {
        await models.Permissions.create({
          groupId: clone._id,
          action: perm.action,
          module: perm.module,
          requiredActions: perm.requiredActions,
          allowed: perm.allowed,
        });
      }

      return clone;
    }
  }

  userGroupSchema.loadClass(UserGroup);

  return userGroupSchema;
};
