import {
  Branches,
  Conversations,
  Departments,
  Units,
  Users
} from '../../../db/models';
import { checkPermission, requireLogin } from '../../permissions/wrappers';
import { IContext } from '../../types';
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

const queryBuilder = async (params: IListArgs) => {
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

  const getUserIds = obj => {
    const userIds = obj.supervisorId
      ? (obj.userIds || []).concat(obj.supervisorId)
      : obj.userIds || [];

    return { $in: userIds };
  };

  if (departmentId) {
    const department = await Departments.getDepartment({ _id: departmentId });

    selector._id = getUserIds(department);
  }

  if (unitId) {
    const unit = await Units.getUnit({ _id: unitId });

    selector._id = getUserIds(unit);
  }

  if (branchId) {
    const branch = await Branches.getBranch({ _id: branchId });

    selector._id = getUserIds(branch);
  }

  return selector;
};

const userQueries = {
  /**
   * Users list
   */
  async users(_root, args: IListArgs, { userBrandIdsSelector }: IContext) {
    const selector = { ...userBrandIdsSelector, ...(await queryBuilder(args)) };

    const { sortField, sortDirection } = args;

    const sort =
      sortField && sortDirection
        ? { [sortField]: sortDirection }
        : { username: 1 };

    return paginate(Users.find(selector).sort(sort), args);
  },

  /**
   * All users
   */
  allUsers(
    _root,
    { isActive }: { isActive: boolean },
    { userBrandIdsSelector }: IContext
  ) {
    const selector: { isActive?: boolean } = userBrandIdsSelector;

    if (isActive) {
      selector.isActive = true;
    }

    return Users.find(selector).sort({ username: 1 });
  },

  /**
   * Get one user
   */
  userDetail(_root, { _id }: { _id: string }) {
    return Users.findOne({ _id });
  },

  /**
   * Get all users count. We will use it in pager
   */
  async usersTotalCount(
    _root,
    args: IListArgs,
    { userBrandIdsSelector }: IContext
  ) {
    const selector = { ...userBrandIdsSelector, ...(await queryBuilder(args)) };

    return Users.find(selector).countDocuments();
  },

  /**
   * Current user
   */
  currentUser(_root, _args, { user }: IContext) {
    return user
      ? Users.findOne({ _id: user._id, isActive: { $ne: false } })
      : null;
  },

  /**
   * Users conversations list
   */
  userConversations(_root, { _id, perPage }: { _id: string; perPage: number }) {
    const selector = { participatedUserIds: { $in: [_id] } };

    const list = paginate(Conversations.find(selector), { perPage });
    const totalCount = Conversations.find(selector).countDocuments();

    return { list, totalCount };
  }
};

requireLogin(userQueries, 'usersTotalCount');
requireLogin(userQueries, 'userDetail');

checkPermission(userQueries, 'users', 'showUsers', []);

export default userQueries;
