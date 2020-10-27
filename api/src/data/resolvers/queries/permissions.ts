import * as _ from 'underscore';
import { Permissions, Users, UsersGroups } from '../../../db/models';
import { actionsMap, IActionsMap, IModuleMap, modulesMap } from '../../permissions/utils';
import { checkPermission, requireLogin } from '../../permissions/wrappers';
import { paginate } from '../../utils';

interface IListArgs {
  page?: number;
  perPage?: number;
  searchValue?: string;
}

const generateSelector = async ({ module, action, userId, groupId, allowed }) => {
  const filter: any = {};

  if (module) {
    filter.module = module;
  }

  if (action) {
    filter.action = action;
  }

  filter.allowed = typeof allowed === 'undefined' ? true : allowed;

  if (userId) {
    const user = await Users.findOne({ _id: userId });

    let permissionIds: string[] = [];

    if (user) {
      const groups = await UsersGroups.find({ _id: { $in: user.groupIds } }, { _id: 1 });
      const groupIds = groups.map(group => group._id);
      const permissions = await Permissions.find({ groupId: { $in: groupIds } });

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
  async permissions(_root, { module, action, userId, groupId, allowed, ...args }) {
    const filter = await generateSelector({ module, action, userId, groupId, allowed });

    return paginate(Permissions.find(filter), args);
  },

  permissionModules() {
    const modules: IModuleMap[] = [];

    for (const m of _.pairs(modulesMap)) {
      modules.push({ name: m[0], description: m[1] });
    }

    return modules;
  },

  permissionActions() {
    const actions: IActionsMap[] = [];

    for (const a of _.pairs(actionsMap)) {
      actions.push({
        name: a[0],
        description: a[1].description,
        module: a[1].module,
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
  async permissionsTotalCount(_root, args) {
    const filter = await generateSelector(args);
    return Permissions.find(filter).countDocuments();
  },
};

const usersGroupQueries = {
  /**
   * Users groups list
   * @param {Object} args - Search params
   * @return {Promise} sorted and filtered users objects
   */
  usersGroups(_root, args: IListArgs) {
    const users = paginate(UsersGroups.find({}), args);
    return users.sort({ name: 1 });
  },

  /**
   * Get all groups list. We will use it in pager
   * @return {Promise} total count
   */
  usersGroupsTotalCount() {
    return UsersGroups.find({}).countDocuments();
  },
};

requireLogin(permissionQueries, 'permissionsTotalCount');
requireLogin(usersGroupQueries, 'usersGroupsTotalCount');

checkPermission(permissionQueries, 'permissions', 'showPermissions', []);
checkPermission(permissionQueries, 'permissionModules', 'showPermissionModules', []);
checkPermission(permissionQueries, 'permissionActions', 'showPermissionActions', []);

checkPermission(usersGroupQueries, 'usersGroups', 'showUsersGroups', []);

export { permissionQueries, usersGroupQueries };
