import { USER_ROLES } from 'erxes-api-shared/core-modules';
import {
  ICursorPaginateParams,
  IUserDocument,
} from 'erxes-api-shared/core-types';
import { cursorPaginate } from 'erxes-api-shared/utils';
import { IContext, IModels } from '~/connectionResolvers';
import { getStructureMemberIds } from '../utils';

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
  isAssignee?: boolean;
  entityIds?: string[];
  segment?: string;
};

const NORMAL_USER_SELECTOR = { role: { $ne: USER_ROLES.SYSTEM } };

const queryBuilder = async (params: IListArgs, models: IModels) => {
  const {
    searchValue,
    isActive,
    requireUsername,
    ids,
    status,
    excludeIds,
    brandIds,
    entityIds,
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

  if (entityIds && entityIds.length > 0) {
    selector.$and = [
      { _id: { $in: await getStructureMemberIds(models, entityIds) } },
    ];
  }

  return selector;
};

export const userQueries = {
  async usersTotalCount(
    _parent: undefined,
    args: IListArgs,
    { models }: IContext,
  ) {
    const selector = {
      ...(await queryBuilder(args, models)),
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
      ...(await queryBuilder(args, models)),
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
