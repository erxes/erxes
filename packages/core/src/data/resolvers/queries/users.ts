import { USER_ROLES } from '@erxes/api-utils/src/constants';
import {
  checkPermission,
  requireLogin
} from '@erxes/api-utils/src/permissions';
import { fetchSegment, sendSegmentsMessage } from '../../../messageBroker';
import { IContext, IModels } from '../../../connectionResolver';
import { paginate } from '../../utils';
import { fetchEs } from '@erxes/api-utils/src/elasticsearch';

export class Builder {
  public params: { segment?: string; segmentData?: string };
  public context;
  public positiveList: any[];
  public negativeList: any[];
  public models: IModels;
  public subdomain: string;

  private contentType: 'users';

  constructor(
    models: IModels,
    subdomain: string,
    params: { segment?: string; segmentData?: string },
    context
  ) {
    this.contentType = 'users';
    this.context = context;
    this.params = params;
    this.models = models;
    this.subdomain = subdomain;

    this.positiveList = [];
    this.negativeList = [];

    this.resetPositiveList();
    this.resetNegativeList();
  }

  public resetNegativeList() {
    this.negativeList = [{ term: { status: 'deleted' } }];
  }

  public resetPositiveList() {
    this.positiveList = [];

    if (this.context.commonQuerySelectorElk) {
      this.positiveList.push(this.context.commonQuerySelectorElk);
    }
  }

  // filter by segment
  public async segmentFilter(segment: any, segmentData?: any) {
    const selector = await fetchSegment(
      this.subdomain,
      segment._id,
      { returnSelector: true },
      segmentData
    );

    this.positiveList = [...this.positiveList, selector];
  }

  public getRelType() {
    return 'users';
  }

  /*
   * prepare all queries. do not do any action
   */
  public async buildAllQueries(): Promise<void> {
    this.resetPositiveList();
    this.resetNegativeList();

    // filter by segment data
    if (this.params.segmentData) {
      const segment = JSON.parse(this.params.segmentData);

      await this.segmentFilter({}, segment);
    }

    // filter by segment
    if (this.params.segment) {
      const segment = await sendSegmentsMessage({
        isRPC: true,
        action: 'findOne',
        subdomain: this.subdomain,
        data: { _id: this.params.segment }
      });

      await this.segmentFilter(segment);
    }
  }

  public async runQueries(action = 'search'): Promise<any> {
    const queryOptions: any = {
      query: {
        bool: {
          must: this.positiveList,
          must_not: this.negativeList
        }
      }
    };

    let totalCount = 0;

    const totalCountResponse = await fetchEs({
      subdomain: this.subdomain,
      action: 'count',
      index: this.contentType,
      body: queryOptions,
      defaultValue: 0
    });

    totalCount = totalCountResponse.count;

    const response = await fetchEs({
      subdomain: this.subdomain,
      action,
      index: this.contentType,
      body: queryOptions
    });

    const list = response.hits.hits.map(hit => {
      return {
        _id: hit._id,
        ...hit._source
      };
    });

    return {
      list,
      totalCount
    };
  }
}

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
  departmentIds: string[];
  branchIds: string[];
  unitId?: string;
  segment?: string;
  segmentData?: string;
}

const NORMAL_USER_SELECTOR = { role: { $ne: USER_ROLES.SYSTEM } };

const queryBuilder = async (
  models: IModels,
  params: IListArgs,
  subdomain: string
) => {
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
    branchId,
    departmentIds,
    branchIds,
    segment,
    segmentData
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

  if (branchId) {
    selector.branchIds = { $in: [branchId] };
  }

  if (departmentId) {
    selector.departmentIds = { $in: [departmentId] };
  }

  if (!!branchIds?.length) {
    selector.branchIds = { $in: branchIds };
  }

  if (!!departmentIds?.length) {
    selector.departmentIds = { $in: departmentIds };
  }

  if (unitId) {
    const unit = await models.Units.getUnit({ _id: unitId });

    const userIds = unit.supervisorId
      ? (unit.userIds || []).concat(unit.supervisorId)
      : unit.userIds || [];

    selector._id = { $in: userIds };
  }

  if (segment || segmentData) {
    const qb = new Builder(models, subdomain, { segment, segmentData }, {});

    await qb.buildAllQueries();

    const { list } = await qb.runQueries();

    selector._id = { $in: list.map(l => l._id) };
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
    { userBrandIdsSelector, models, subdomain }: IContext
  ) {
    const selector = {
      ...userBrandIdsSelector,
      ...(await queryBuilder(models, args, subdomain)),
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
    {
      isActive,
      ids,
      assignedToMe
    }: { isActive: boolean; ids: string[]; assignedToMe: string },
    { userBrandIdsSelector, user, models }: IContext
  ) {
    const selector: { isActive?: boolean; _id?: any } = userBrandIdsSelector;

    if (isActive) {
      selector.isActive = true;
    }
    if (!!ids?.length) {
      selector._id = { $in: ids };
    }
    if (assignedToMe === 'true') {
      selector._id = user._id;
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
    { userBrandIdsSelector, models, subdomain }: IContext
  ) {
    const selector = {
      ...userBrandIdsSelector,
      ...(await queryBuilder(models, args, subdomain)),
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
