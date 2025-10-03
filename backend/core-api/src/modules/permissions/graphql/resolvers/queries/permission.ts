import { IPermissionDocument } from 'erxes-api-shared/core-types';
import { cursorPaginate } from 'erxes-api-shared/utils';
import { IContext, IModels } from '~/connectionResolvers';
import {
  getPermissionActions,
  getPermissionModules,
} from '~/modules/permissions/utils';

const generateSelector = async (
  models: IModels,
  { module, action, userId, groupId, allowed },
) => {
  const filter: any = {};

  if (module) {
    filter.module = module;
  }

  if (action) {
    filter.action = action;
  }

  filter.allowed = typeof allowed === 'undefined' ? true : allowed;

  if (userId) {
    const user = await models.Users.findOne({ _id: userId });

    let permissionIds: string[] = [];

    if (user) {
      const groups = await models.UsersGroups.find(
        { _id: { $in: user.groupIds } },
        { _id: 1 },
      );
      const groupIds = groups.map((group) => group._id);
      const permissions = await models.Permissions.find({
        groupId: { $in: groupIds },
      });

      permissionIds = permissions.map((permission) => permission._id);
    }

    filter.$or = [{ userId }, { _id: { $in: permissionIds } }];
  }

  if (groupId) {
    filter.groupId = groupId;
  }

  return filter;
};

export const permissionQueries = {
  /**
   * Permissions list
   * @param {Object} args
   * @param {String} args.module
   * @param {String} args.action
   * @param {String} args.userId
   * @param {Int} args.page
   * @param {Int} args.perPage
   * @return {Promise} filtered permissions list by given parameter
   */
  async permissions(_root, args, { models }: IContext) {
    const { module, action, userId, groupId, allowed } = args;

    const filter = await generateSelector(models, {
      module,
      action,
      userId,
      groupId,
      allowed,
    });

    const { list, pageInfo, totalCount } =
      await cursorPaginate<IPermissionDocument>({
        model: models.Permissions,
        params: args,
        query: filter,
      });

    return { list, pageInfo, totalCount };
  },

  async permissionModules() {
    return getPermissionModules();
  },

  async permissionActions() {
    return getPermissionActions();
  },

  /**
   * Get all permissions count. We will use it in pager
   * @param {String} args.module
   * @param {String} args.action
   * @param {String} args.userId
   * @return {Promise} total count
   */
  async permissionsTotalCount(_root, args, { models }: IContext) {
    const filter = await generateSelector(models, args);
    return models.Permissions.find(filter).countDocuments();
  },
};
