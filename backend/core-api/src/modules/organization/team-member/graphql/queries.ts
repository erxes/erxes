import {
  ICursorPaginateParams,
  IUserDocument,
} from 'erxes-api-shared/core-types';
import { USER_ACTIVITY_SLOT_MS } from 'erxes-api-shared/core-modules';
import {
  cursorPaginate,
  redis,
  userActivityTrackingKey,
} from 'erxes-api-shared/utils';
import { IContext, IModels } from '~/connectionResolvers';
import { listUserSessions, readSessionCookie } from '@/auth/session';
import { loadTeamAvailabilitySettings } from '../availability';

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
};

const queryBuilder = async (params: IListArgs, models: IModels) => {
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
    departmentIds,
    branchIds,
    unitId,
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

  if (branchIds && branchIds.length > 0) {
    selector.branchIds = { $in: branchIds };
  }

  if (departmentIds && departmentIds.length > 0) {
    selector.departmentIds = { $in: departmentIds };
  }

  if (unitId) {
    const unit = await models.Units.findOne({ _id: unitId }).lean();
    const unitUserIds = unit?.userIds || [];

    selector._id = selector._id
      ? { ...selector._id, $in: unitUserIds }
      : { $in: unitUserIds };
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
    const selector = await models.Users.staffQuery(
      await queryBuilder(args, models),
    );

    return models.Users.countDocuments(selector);
  },

  // Devices and IPs are account-security data, gated like password resets
  async userSessions(
    _parent: undefined,
    { _id }: { _id: string },
    { subdomain, requestInfo, checkPermission }: IContext,
  ) {
    await checkPermission('teamMembersResetPassword');

    return listUserSessions(
      subdomain,
      _id,
      readSessionCookie(requestInfo.cookies),
    );
  },

  async userActivitySlots(
    _parent: undefined,
    { _id, days = 30 }: { _id: string; days?: number },
    { models, subdomain, user, checkPermission }: IContext,
  ) {
    // Own activity is always visible; others' only with the permission
    if (user?._id !== _id) {
      await checkPermission('teamMembersViewActivity');
    }

    const slotMinutes = USER_ACTIVITY_SLOT_MS / 60_000;

    if (!(await redis.exists(userActivityTrackingKey(subdomain)))) {
      return { enabled: false, slotMinutes, slots: [] };
    }

    return {
      enabled: true,
      slotMinutes,
      slots: await models.UserActivities.getActivitySlots(_id, days),
    };
  },

  async userActivityRanking(
    _parent: undefined,
    { days = 7, timeZone = 'UTC' }: { days?: number; timeZone?: string },
    { models, subdomain, checkPermission }: IContext,
  ) {
    await checkPermission('teamMembersViewActivity');

    if (!(await redis.exists(userActivityTrackingKey(subdomain)))) {
      return { enabled: false, items: [], series: [] };
    }

    const users = await models.Users.find({ isActive: true }).lean();
    const userIds = users.map((user) => user._id);
    const [byUser, series] = await Promise.all([
      models.UserActivities.getActivityByUser(userIds, days),
      models.UserActivities.getTeamDailySeries(userIds, days, timeZone),
    ]);

    // Members with no activity stay in the list so inactive ones are visible
    const items = users.map((user) => ({
      user,
      activeMinutes: byUser.get(user._id)?.activeMinutes ?? 0,
      lastActiveAt: byUser.get(user._id)?.lastActiveAt ?? null,
    }));

    items.sort(
      (a, b) =>
        b.activeMinutes - a.activeMinutes ||
        (b.lastActiveAt?.getTime() ?? 0) - (a.lastActiveAt?.getTime() ?? 0),
    );

    return { enabled: true, items, series };
  },

  async teamAvailabilitySettings(
    _root: undefined,
    _args: undefined,
    { models }: IContext,
  ) {
    return loadTeamAvailabilitySettings(models);
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

    return models.Users.find(await models.Users.staffQuery(selector)).sort({
      username: 1,
    });
  },

  async users(
    _parent: undefined,
    args: IListArgs & ICursorPaginateParams,
    { models }: IContext,
  ) {
    const selector = await models.Users.staffQuery(
      await queryBuilder(args, models),
    );

    const { list, totalCount, pageInfo } = await cursorPaginate<IUserDocument>({
      model: models.Users,
      params: args,
      query: selector,
    });

    return { list, totalCount, pageInfo };
  },
};
