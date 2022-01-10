import { IUserDocument } from '@erxes/common-types';
import {
  requireLogin,
  checkPermission,
  paginate,
  IContext
} from '@erxes/api-utils';
import { EngageMessages } from '../../models';
import { _Tags, _Customers } from '../../apiCollections';

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
  const Tags = await _Tags();

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
  const Tags = await _Tags();

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
      args
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
  engagesConfigDetail(_root, _args, { dataSources }: IContext) {
    return dataSources.EngagesAPI.engagesConfigDetail();
  },

  async engageReportsList(
    _root,
    params: IReportParams,
    { dataSources }: IContext
  ) {
    const {
      list = [],
      totalCount
    } = await dataSources.EngagesAPI.engageReportsList(params);
    const modifiedList: any[] = [];
    const Customers = await _Customers();

    for (const item of list) {
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
  engageVerifiedEmails(_root, _args, { dataSources }: IContext) {
    return dataSources.EngagesAPI.engagesGetVerifiedEmails();
  },

  async engageEmailPercentages(_root, _args, { dataSources }: IContext) {
    const response = await dataSources.EngagesAPI.getAverageStats();

    return response.data;
  }
};

requireLogin(engageQueries, 'engageMessagesTotalCount');
requireLogin(engageQueries, 'engageMessageCounts');
requireLogin(engageQueries, 'engageMessageDetail');
requireLogin(engageQueries, 'engageEmailPercentages');

checkPermission(engageQueries, 'engageMessages', 'showEngagesMessages', []);

export default engageQueries;
