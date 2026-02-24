import {
  IActionsMap,
  IPermission,
  IPermissionDocument,
  IPermissionParams,
} from 'erxes-api-shared/core-types';
import { Model } from 'mongoose';
import { EventDispatcherReturn } from 'erxes-api-shared/core-modules';
import { IModels } from '~/connectionResolvers';
import { getPermissionActionsMap } from '../../utils';
import { permissionSchema } from '../definitions/permissions';

export interface IPermissionModel extends Model<IPermissionDocument> {
  createPermission(doc: IPermissionParams): Promise<IPermissionDocument[]>;
  removePermission(ids: string[]): Promise<IPermissionDocument>;
  getPermission(id: string): Promise<IPermissionDocument>;
}

export const loadPermissionClass = (
  models: IModels,
  subdomain: string,
  { sendDbEventLog }: EventDispatcherReturn,
) => {
  class Permission {
    /**
     * Create a permission
     * @param  {Object} doc object
     * @return {Promise} Newly created permission object
     */
    public static async createPermission(doc: IPermissionParams) {
      const permissions: IPermissionDocument[] = [];

      let filter = {};

      let actionObj: IActionsMap;

      const actionsMap = await getPermissionActionsMap();

      for (const action of doc.actions) {
        const entry: IPermission = {
          action,
          module: doc.module,
          allowed: doc.allowed || false,
          requiredActions: [],
        };

        actionObj = actionsMap[action];

        if (actionObj && actionObj.use) {
          entry.requiredActions = actionObj.use;
        }

        if (doc.userIds) {
          for (const userId of doc.userIds) {
            filter = { action, userId };

            const entryObj = await models.Permissions.findOne(filter);

            if (!entryObj) {
              const newEntry = await models.Permissions.create({
                ...entry,
                userId,
              });
              sendDbEventLog({
                action: 'create',
                docId: newEntry._id,
                currentDocument: newEntry.toObject(),
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
                groupId,
              });
              sendDbEventLog({
                action: 'create',
                docId: newEntry._id,
                currentDocument: newEntry.toObject(),
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
        _id: { $in: ids },
      }).countDocuments();

      if (count !== ids.length) {
        throw new Error('Permission not found');
      }

      const toDelete = await models.Permissions.find({ _id: { $in: ids } });
      const result = await models.Permissions.deleteMany({ _id: { $in: ids } });
      if (toDelete.length > 0) {
        sendDbEventLog({
          action: 'deleteMany',
          docIds: toDelete.map((d) => d._id),
        });
      }
      return result;
    }

    public static async getPermission(id: string) {
      const permission = await models.Permissions.findOne({ _id: id });

      if (!permission) {
        throw new Error('Permission not found');
      }

      return permission;
    }
  }

  permissionSchema.loadClass(Permission);

  return permissionSchema;
};
