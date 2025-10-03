import { USER_ROLES } from 'erxes-api-shared/core-modules';
import {
  ICursorPaginateParams,
  IUserDocument,
} from 'erxes-api-shared/core-types';
import { cursorPaginate } from 'erxes-api-shared/utils';
import { IContext } from '~/connectionResolvers';

type IListArgs = {
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
  isAssignee?: boolean;
  departmentIds: string[];
  branchIds: string[];
  unitId?: string;
  segment?: string;
  segmentData?: string;
};

const NORMAL_USER_SELECTOR = { role: { $ne: USER_ROLES.SYSTEM } };

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
    branchId,
  } = params;

  const selector: any = {
    isActive,
  };
  if (searchValue) {
    const fields = [
      { email: new RegExp(`.*${params.searchValue}.*`, 'i') },
      { employeeId: new RegExp(`.*${params.searchValue}.*`, 'i') },
      { username: new RegExp(`.*${params.searchValue}.*`, 'i') },
      { 'details.fullName': new RegExp(`.*${params.searchValue}.*`, 'i') },
      { 'details.position': new RegExp(`.*${params.searchValue}.*`, 'i') },
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
    if (excludeIds) {
      selector._id = { $nin: ids };
    } else {
      selector._id = { $in: ids };
    }
  }

  if (status) {
    selector.registrationToken = { $eq: null };
  }

  if (brandIds && brandIds.length > 0) {
    selector.brandIds = { $in: brandIds };
  }

  if (branchId) {
    selector.branchIds = { $in: [branchId] };
  }

  if (departmentId) {
    selector.departmentIds = { $in: [departmentId] };
  }

  return selector;
};

export const userQueries = {
  async userMovements(_parent, args, { models }: IContext) {
    return await models.UserMovements.find(args).sort({ createdAt: -1 });
  },
  async usersTotalCount(
    _parent: undefined,
    args: IListArgs,
    { models }: IContext,
  ) {
    const selector = {
      ...(await queryBuilder(args)),
      ...NORMAL_USER_SELECTOR,
    };

    return models.Users.countDocuments(selector);
  },

  async userDetail(
    _parent: undefined,
    { _id }: { _id: string },
    { models }: IContext,
  ) {
    return models.Users.findOne({ _id });
  },

  async allUsers(
    _parent: undefined,
    {
      searchValue,
      isActive,
      ids,
      assignedToMe,
    }: {
      searchValue: string;
      isActive: boolean;
      ids: string[];
      assignedToMe: string;
    },
    { user, models }: IContext,
  ) {
    const selector: any = {};

    if (searchValue) {
      const fields = [
        { email: new RegExp(`.*${searchValue}.*`, 'i') },
        { employeeId: new RegExp(`.*${searchValue}.*`, 'i') },
        { username: new RegExp(`.*${searchValue}.*`, 'i') },
        { 'details.fullName': new RegExp(`.*${searchValue}.*`, 'i') },
        { 'details.position': new RegExp(`.*${searchValue}.*`, 'i') },
      ];

      selector.$or = fields;
    }

    if (isActive) {
      selector.isActive = true;
    }
    if (ids?.length) {
      selector._id = { $in: ids };
    }
    if (assignedToMe === 'true') {
      selector._id = user._id;
    }

    return models.Users.find({ ...selector, ...NORMAL_USER_SELECTOR }).sort({
      username: 1,
    });
  },

  async users(
    _parent: undefined,
    args: IListArgs & ICursorPaginateParams,
    { models }: IContext,
  ) {
    const selector = {
      ...(await queryBuilder(args)),
      ...NORMAL_USER_SELECTOR,
    };

    const { list, totalCount, pageInfo } = await cursorPaginate<IUserDocument>({
      model: models.Users,
      params: args,
      query: selector,
    });

    return { list, totalCount, pageInfo };
  },
};
