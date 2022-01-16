import { IUserDocument } from '@erxes/common-types';
import { paginate } from '@erxes/api-utils/src/core';
import { IContext } from '@erxes/api-utils/src/types';
import {
  checkPermission,
  requireLogin
} from '@erxes/api-utils/src/permissions';
import { awsRequests } from '../../trackers/engageTracker';
import { EngageMessages, Configs, DeliveryReports } from '../../models';
import { Tags, Customers } from '../../apiCollections';
import { prepareAvgStats } from '../../utils';

interface IListArgs {
  kind?: string;
  status?: string;
  tag?: string;
  ids?: string;
  page?: number;
  perPage?: number;
}

interface IQuery {
  kind?: string;
}

interface IStatusQueryBuilder {
  [index: string]: boolean | string;
}

interface ICountsByStatus {
  [index: string]: number;
}

interface ICountsByTag {
  [index: string]: number;
}

interface IReportParams {
  page?: number;
  perPage?: number;
  customerId?: string;
  status?: string;
}

// basic count helper
const count = async (selector: {}): Promise<number> => {
  const res = await EngageMessages.find(selector).countDocuments();
  return Number(res);
};

// Tag query builder
const tagQueryBuilder = (tagId: string) => ({ tagIds: tagId });

// status query builder
const statusQueryBuilder = (
  status: string,
  user?: IUserDocument
): IStatusQueryBuilder | undefined => {
  if (status === 'live') {
    return { isLive: true };
  }

  if (status === 'draft') {
    return { isDraft: true };
  }

  if (status === 'yours' && user) {
    return { fromUserId: user._id };
  }

  // status is 'paused'
  return { isLive: false };
};

// count for each kind
const countsByKind = async commonSelector => ({
  all: await count(commonSelector),
  auto: await count({ ...commonSelector, kind: 'auto' }),
  visitorAuto: await count({ ...commonSelector, kind: 'visitorAuto' }),
  manual: await count({ ...commonSelector, kind: 'manual' })
});

// count for each status type
const countsByStatus = async (
  commonSelector,
  { kind, user }: { kind: string; user: IUserDocument }
): Promise<ICountsByStatus> => {
  const query: IQuery = commonSelector;

  if (kind) {
    query.kind = kind;
  }

  return {
    live: await count({ ...query, ...statusQueryBuilder('live') }),
    draft: await count({ ...query, ...statusQueryBuilder('draft') }),
    paused: await count({ ...query, ...statusQueryBuilder('paused') }),
    yours: await count({ ...query, ...statusQueryBuilder('yours', user) })
  };
};

// cout for each tag
const countsByTag = async (
  commonSelector,
  {
    kind,
    status,
    user
  }: {
    kind: string;
    status: string;
    user: IUserDocument;
  }
): Promise<ICountsByTag> => {
  let query: any = commonSelector;

  if (kind) {
    query.kind = kind;
  }

  if (status) {
    query = { ...query, ...statusQueryBuilder(status, user) };
  }
  const tags = await Tags.find({ type: 'engageMessage' });

  // const response: {[name: string]: number} = {};
  const response: ICountsByTag = {};

  for (const tag of tags) {
    response[tag._id] = await count({ ...query, ...tagQueryBuilder(tag._id) });
  }

  return response;
};

/*
 * List filter
 */
const listQuery = async (
  commonSelector,
  { kind, status, tag, ids }: IListArgs,
  user: IUserDocument
) => {
  let query = commonSelector;

  // filter by ids
  if (ids) {
    query._id = { $in: ids.split(',') };
  }

  // filter by kind
  if (kind) {
    query.kind = kind;
  }

  // filter by status
  if (status) {
    query = { ...query, ...statusQueryBuilder(status, user) };
  }

  // filter by tag
  if (tag) {
    const object = await Tags.findOne({ _id: tag });

    query = { ...query, tagIds: { $in: [tag, ...(object?.relatedIds || [])] } };
  }

  return query;
};

const engageQueries = {
  /**
   * Group engage messages counts by kind, status, tag
   */
  engageMessageCounts(
    _root,
    { name, kind, status }: { name: string; kind: string; status: string },
    { user, commonQuerySelector }: IContext
  ) {
    if (name === 'kind') {
      return countsByKind(commonQuerySelector);
    }

    if (name === 'status') {
      return countsByStatus(commonQuerySelector, { kind, user });
    }

    return countsByTag(commonQuerySelector, { kind, status, user });
  },

  /**
   * Engage messages list
   */
  async engageMessages(
    _root,
    args: IListArgs,
    { user, commonQuerySelector }: IContext
  ) {
    const query = await listQuery(commonQuerySelector, args, user);

    return paginate(
      EngageMessages.find(query).sort({
        createdAt: -1
      }),
      { ...args, ids: args.ids ? args.ids.split(',') : [] }
    );
  },

  /**
   * Get one message
   */
  engageMessageDetail(_root, { _id }: { _id: string }) {
    return EngageMessages.findOne({ _id });
  },

  /**
   * Config detail
   */
  engagesConfigDetail(_root, _args) {
    return Configs.find({});
  },

  async engageReportsList(_root, params: IReportParams) {
    const { page, perPage, customerId, status } = params;
    const _page = Number(page || '1');
    const _limit = Number(perPage || '20');
    const filter: any = {};

    if (customerId) {
      filter.customerId = customerId;
    }
    if (status) {
      filter.status = status;
    }

    const deliveryReports = await DeliveryReports.find(filter)
      .limit(_limit)
      .skip((_page - 1) * _limit)
      .sort({ createdAt: -1 });

    if (!deliveryReports) {
      return { list: [], totalCount: 0 };
    }

    const totalCount = await DeliveryReports.countDocuments();

    const modifiedList: any[] = [];

    for (const item of deliveryReports) {
      const modifiedItem = item;

      if (item.customerId) {
        const customer = await Customers.findOne({ _id: item.customerId });

        if (customer) {
          modifiedItem.customerName = Customers.getCustomerName(customer);
        }
      }

      modifiedList.push(modifiedItem);
    }

    return { totalCount, list: modifiedList };
  },

  /**
   * Get all messages count. We will use it in pager
   */
  async engageMessagesTotalCount(
    _root,
    args: IListArgs,
    { user, commonQuerySelector }: IContext
  ) {
    const query = await listQuery(commonQuerySelector, args, user);
    return EngageMessages.find(query).countDocuments();
  },

  /**
   * Get all verified emails
   */
  engageVerifiedEmails() {
    return awsRequests.getVerifiedEmails();
  },

  async engageEmailPercentages() {
    const stats = await prepareAvgStats();

    return stats[0];
  }
};

requireLogin(engageQueries, 'engageMessagesTotalCount');
requireLogin(engageQueries, 'engageMessageCounts');
requireLogin(engageQueries, 'engageMessageDetail');
requireLogin(engageQueries, 'engageEmailPercentages');

checkPermission(engageQueries, 'engageMessages', 'showEngagesMessages', []);

export default engageQueries;
