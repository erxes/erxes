import { IContext, IModels } from '../../../connectionResolver';
import * as _ from 'underscore';
import {
  actionsMap,
  IActionsMap,
  IModuleMap,
  modulesMap
} from '../../permissions/utils';
import { checkPermission, requireLogin } from '../../permissions/wrappers';
import { paginate } from '../../utils';

interface IListArgs {
  page?: number;
  perPage?: number;
  searchValue?: string;
}

const generateSelector = async (
  models: IModels,
  { module, action, userId, groupId, allowed }
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
        { _id: 1 }
      );
      const groupIds = groups.map(group => group._id);
      const permissions = await models.Permissions.find({
        groupId: { $in: groupIds }
      });

      permissionIds = permissions.map(permission => permission._id);
    }

    filter.$or = [{ userId }, { _id: { $in: permissionIds } }];
  }

  if (groupId) {
    filter.groupId = groupId;
  }

  return filter;
};

const permissionQueries = {
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
  async permissions(
    _root,
    { module, action, userId, groupId, allowed, ...args },
    { models }: IContext
  ) {
    const filter = await generateSelector(models, {
      module,
      action,
      userId,
      groupId,
      allowed
    });

    return paginate(models.Permissions.find(filter), args);
  },

  permissionModules() {
    const modules: IModuleMap[] = [];

    for (const m of _.pairs(modulesMap)) {
      modules.push({ name: m[0], description: m[1].description });
    }

    return modules;
  },

  permissionActions() {
    const actions: IActionsMap[] = [];

    for (const a of _.pairs(actionsMap)) {
      actions.push({
        name: a[0],
        description: a[1].description,
        module: a[1].module
      });
    }

    return actions;
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
  }
};

const usersGroupQueries = {
  /**
   * Users groups list
   * @param {Object} args - Search params
   * @return {Promise} sorted and filtered users objects
   */
  usersGroups(_root, args: IListArgs, { models }: IContext) {
    const users = paginate(models.UsersGroups.find({}), {
      ...args,
      perPage: args.perPage || 50
    });

    return users.sort({ name: 1 });
  },

  /**
   * Get all groups list. We will use it in pager
   * @return {Promise} total count
   */
  usersGroupsTotalCount(_root, _args, { models }: IContext) {
    return models.UsersGroups.find({}).countDocuments();
  }
};

requireLogin(permissionQueries, 'permissionsTotalCount');
requireLogin(usersGroupQueries, 'usersGroupsTotalCount');

checkPermission(permissionQueries, 'permissions', 'showPermissions', []);
checkPermission(
  permissionQueries,
  'permissionModules',
  'showPermissionModules',
  []
);
checkPermission(
  permissionQueries,
  'permissionActions',
  'showPermissionActions',
  []
);

checkPermission(usersGroupQueries, 'usersGroups', 'showUsersGroups', []);

export { permissionQueries, usersGroupQueries };
