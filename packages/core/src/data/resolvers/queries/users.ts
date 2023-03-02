import { USER_ROLES } from '@erxes/api-utils/src/constants';
import {
  checkPermission,
  requireLogin
} from '@erxes/api-utils/src/permissions';
import { IContext, IModels } from '../../../connectionResolver';
import { paginate } from '../../utils';

interface IListArgs {
  page?: number;
  perPage?: number;
  sortDirection?: number;
  sortField?: string;
  searchValue?: string;
  excludeIds?: boolean;
  isActive?: boolean;
  requireUsername: boolean;
  ids?: string[];
  email?: string;
  status?: string;
  brandIds?: string[];
  departmentId?: string;
  branchId?: string;
  unitId?: string;
}

const NORMAL_USER_SELECTOR = { role: { $ne: USER_ROLES.SYSTEM } };

const queryBuilder = async (models: IModels, params: IListArgs) => {
  const {
    searchValue,
    isActive,
    requireUsername,
    ids,
    status,
    excludeIds,
    brandIds,
    departmentId,
    unitId,
    branchId
  } = params;

  const selector: any = {
    isActive
  };

  if (searchValue) {
    const fields = [
      { email: new RegExp(`.*${params.searchValue}.*`, 'i') },
      { employeeId: new RegExp(`.*${params.searchValue}.*`, 'i') },
      { 'details.fullName': new RegExp(`.*${params.searchValue}.*`, 'i') },
      { 'details.position': new RegExp(`.*${params.searchValue}.*`, 'i') }
    ];

    selector.$or = fields;
  }

  if (requireUsername) {
    selector.username = { $ne: null };
  }

  if (isActive === undefined || isActive === null) {
    selector.isActive = true;
  }

  if (ids && ids.length > 0) {
    return { _id: { [excludeIds ? '$nin' : '$in']: ids }, isActive: true };
  }

  if (status) {
    selector.registrationToken = { $eq: null };
  }

  if (brandIds && brandIds.length > 0) {
    selector.brandIds = { $in: brandIds };
  }

  const getUserIds = async (contentType, contentTypeId, obj) => {
    let userIds: string[] = [];
    const users = await models.Users.find({
      [`${contentType}Ids`]: contentTypeId
    });

    userIds = users.map(user => user._id);

    userIds = obj.supervisorId ? userIds.concat(obj.supervisorId) : userIds;

    return { $in: userIds };
  };

  if (departmentId) {
    const department = await models.Departments.getDepartment({
      _id: departmentId
    });

    selector._id = await getUserIds('department', departmentId, department);
  }

  if (unitId) {
    const unit = await models.Units.getUnit({ _id: unitId });

    const userIds = unit.supervisorId
      ? (unit.userIds || []).concat(unit.supervisorId)
      : unit.userIds || [];

    selector._id = { $in: userIds };
  }

  if (branchId) {
    const branch = await models.Branches.getBranch({
      _id: branchId
    });

    selector._id = await getUserIds('branch', branchId, branch);
  }

  return selector;
};

const userQueries = {
  /**
   * Users list
   */
  async users(
    _root,
    args: IListArgs,
    { userBrandIdsSelector, models }: IContext
  ) {
    const selector = {
      ...userBrandIdsSelector,
      ...(await queryBuilder(models, args)),
      ...NORMAL_USER_SELECTOR
    };

    const { sortField, sortDirection } = args;

    const sort =
      sortField && sortDirection
        ? { [sortField]: sortDirection }
        : { username: 1 };

    return paginate(models.Users.find(selector).sort(sort), args);
  },

  /**
   * All users
   */
  allUsers(
    _root,
    { isActive }: { isActive: boolean },
    { userBrandIdsSelector, models }: IContext
  ) {
    const selector: { isActive?: boolean } = userBrandIdsSelector;

    if (isActive) {
      selector.isActive = true;
    }

    return models.Users.find({ ...selector, ...NORMAL_USER_SELECTOR }).sort({
      username: 1
    });
  },

  /**
   * Get one user
   */
  userDetail(_root, { _id }: { _id: string }, { models }: IContext) {
    return models.Users.findOne({ _id });
  },

  /**
   * Get all users count. We will use it in pager
   */
  async usersTotalCount(
    _root,
    args: IListArgs,
    { userBrandIdsSelector, models }: IContext
  ) {
    const selector = {
      ...userBrandIdsSelector,
      ...(await queryBuilder(models, args)),
      ...NORMAL_USER_SELECTOR
    };

    return models.Users.find(selector).countDocuments();
  },

  /**
   * Current user
   */
  currentUser(_root, _args, { user, models }: IContext) {
    return user
      ? models.Users.findOne({ _id: user._id, isActive: { $ne: false } })
      : null;
  },

  /**
   *  Get all user movements
   */
  async userMovements(_root, args, { models }: IContext) {
    return await models.UserMovements.find(args).sort({ createdAt: -1 });
  }
};

requireLogin(userQueries, 'usersTotalCount');
requireLogin(userQueries, 'userDetail');

checkPermission(userQueries, 'users', 'showUsers', []);

export default userQueries;
