import { checkPermission } from 'erxes-api-shared/core-modules';
import { IUserDocument } from 'erxes-api-shared/core-types';
import { paginate, sendTRPCMessage } from 'erxes-api-shared/utils';
import { FilterQuery } from 'mongoose';
import { IContext, IModels } from '~/connectionResolvers';
import {
  ICount,
  IEngageMessageDocument,
  IListArgs,
  IQuery,
  IReportParams,
  ISmsDeliveryParams,
  IStatusQueryBuilder,
} from '~/modules/broadcast/@types/types';
import { awsRequests } from '~/modules/broadcast/trackers.ts/engageTracker';
import { getCustomerName, prepareAvgStats } from '~/modules/broadcast/utils';

type CommonSelector = FilterQuery<IEngageMessageDocument>;

// basic count helper
const count = async (models: IModels, selector: {}): Promise<number> => {
  const res = await models.EngageMessages.find(selector).countDocuments();
  return Number(res);
};

// Tag query builder
const tagQueryBuilder = (tagId: string) => ({ tagIds: tagId });

// status query builder
const statusQueryBuilder = (
  status: string,
  user?: IUserDocument,
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
const countsByKind = async (
  models: IModels,
  commonSelector: CommonSelector,
) => ({
  all: await count(models, commonSelector),
  auto: await count(models, { ...commonSelector, kind: 'auto' }),
  visitorAuto: await count(models, { ...commonSelector, kind: 'visitorAuto' }),
  manual: await count(models, { ...commonSelector, kind: 'manual' }),
});

// count for each status type
const countsByStatus = async (
  models: IModels,
  commonSelector: CommonSelector,
  { kind, user }: { kind: string; user: IUserDocument },
): Promise<ICount> => {
  const query: IQuery = commonSelector;

  if (kind) {
    query.kind = kind;
  }

  return {
    live: await count(models, { ...query, ...statusQueryBuilder('live') }),
    draft: await count(models, { ...query, ...statusQueryBuilder('draft') }),
    paused: await count(models, { ...query, ...statusQueryBuilder('paused') }),
    yours: await count(models, {
      ...query,
      ...statusQueryBuilder('yours', user),
    }),
  };
};

// cout for each tag
const countsByTag = async (
  models: IModels,
  subdomain: string,
  commonSelector,
  {
    kind,
    status,
    user,
  }: {
    kind: string;
    status: string;
    user;
  },
): Promise<ICount> => {
  let query: any = commonSelector;

  if (kind) {
    query.kind = kind;
  }

  if (status) {
    query = { ...query, ...statusQueryBuilder(status, user) };
  }

  const tags = await sendTRPCMessage({
    subdomain,
    pluginName: 'core',
    method: 'query',
    module: 'tags',
    action: 'find',
    input: { type: 'engageMessage' },
  });

  // const response: {[name: string]: number} = {};
  const response: ICount = {};

  for (const tag of tags) {
    response[tag._id] = await count(models, {
      ...query,
      ...tagQueryBuilder(tag._id),
    });
  }

  return response;
};

/*
 * List filter
 */
const listQuery = async (
  subdomain: string,
  commonSelector,
  { kind, status, tag, ids }: IListArgs,
  user,
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
    const object = await sendTRPCMessage({
      subdomain,
      pluginName: 'core',
      method: 'query',
      module: 'tags',
      action: 'findOne',
      input: { _id: tag },
    });

    const relatedIds = object && object.relatedIds ? object.relatedIds : [];

    query = { ...query, tagIds: { $in: [tag, ...relatedIds] } };
  }

  return query;
};

interface ICountParams {
  name: string;
  kind: string;
  status: string;
}

const engageQueries = {
  /**
   * Group engage messages counts by kind, status, tag
   */
  async engageMessageCounts(
    _root: undefined,
    { name, kind, status }: ICountParams,
    { user, commonQuerySelector, subdomain, models }: IContext,
  ) {
    if (name === 'kind') {
      return countsByKind(models, commonQuerySelector);
    }

    if (name === 'status') {
      return countsByStatus(models, commonQuerySelector, { kind, user });
    }

    return countsByTag(models, subdomain, commonQuerySelector, {
      kind,
      status,
      user,
    });
  },

  /**
   * Engage messages list
   */
  async engageMessages(
    _root: undefined,
    args: IListArgs,
    { user, commonQuerySelector, models, subdomain }: IContext,
  ) {
    const query = await listQuery(subdomain, commonQuerySelector, args, user);

    return paginate(
      models.EngageMessages.find(query).sort({
        createdAt: -1,
      }),
      { ...args, ids: args.ids ? args.ids.split(',') : [] },
    );
  },

  /**
   * Get one message
   */
  async engageMessageDetail(
    _root: undefined,
    { _id }: { _id: string },
    { models }: IContext,
  ) {
    return models.EngageMessages.findOne({ _id });
  },

  /**
   * Config detail
   */
  async engagesConfigDetail(_root, _args, { models }: IContext) {
    return models.Configs.find({});
  },

  async engageReportsList(
    _root: undefined,
    params: IReportParams,
    { models, subdomain }: IContext,
  ) {
    const { page, perPage, customerId, status, searchValue } = params;
    const _page = Number(page || '1');
    const _limit = Number(perPage || '20');
    const filter: any = {};

    if (customerId) {
      filter.customerId = customerId;
    }
    if (status) {
      filter.status = status;
    }
    if (searchValue) {
      filter.email = { $regex: searchValue, $options: '$i' };
    }

    const deliveryReports = await models.DeliveryReports.find(filter)
      .limit(_limit)
      .skip((_page - 1) * _limit)
      .sort({ createdAt: -1 })
      .lean();

    if (!deliveryReports) {
      return { list: [], totalCount: 0 };
    }

    const totalCount = await models.DeliveryReports.countDocuments(filter);

    const modifiedList: any[] = [];

    const customerIds = deliveryReports.map((d) => d.customerId);

    const customers = await sendTRPCMessage({
      subdomain,
      pluginName: 'core',
      method: 'query',
      module: 'customer',
      action: 'find',
      input: { _id: { $in: customerIds } },
    });

    for (const item of deliveryReports) {
      const modifiedItem = item;

      if (item.customerId) {
        const customer = customers.find((c) => c._id === item.customerId);

        if (customer) {
          modifiedItem.customerName = getCustomerName(customer);
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
    _root: undefined,
    args: IListArgs,
    { user, commonQuerySelector, subdomain, models }: IContext,
  ) {
    const query = await listQuery(subdomain, commonQuerySelector, args, user);
    return models.EngageMessages.find(query).countDocuments();
  },

  /**
   * Get all verified emails
   */
  async engageVerifiedEmails(
    _root: undefined,
    _args,
    { models, subdomain }: IContext,
  ) {
    const users = await sendTRPCMessage({
      subdomain,
      pluginName: 'core',
      method: 'query',
      module: 'users',
      action: 'find',
      input: { isActive: true },
    });

    const userEmails = users.map((u) => u.email);
    const allVerifiedEmails: any =
      (await awsRequests.getVerifiedEmails(models)) || [];

    if (!allVerifiedEmails) {
      return [];
    }

    return allVerifiedEmails.filter((email) => userEmails.includes(email));
  },

  async engageEmailPercentages(_root: undefined, _args, { models }: IContext) {
    try {
      const stats = await prepareAvgStats(models);

      return stats[0];
    } catch (e) {
      console.log(e.message);

      return e;
    }
  },

  async engageLogs(_root, args, { models }: IContext) {
    return paginate(
      models.Logs.find({ engageMessageId: args.engageMessageId }).sort({
        createdAt: -1,
      }),
      { ...args },
    );
  },

  async engageSmsDeliveries(
    _root: undefined,
    params: ISmsDeliveryParams,
    { models }: IContext,
  ) {
    const { type, to, page, perPage } = params;

    if (type !== 'campaign') {
      return { status: 'error', message: `Invalid parameter type: "${type}"` };
    }

    const filter: any = {};

    if (to && !(to === 'undefined' || to === 'null')) {
      filter.to = { $regex: to, $options: '$i' };
    }

    const _page = Number(page || '1');
    const _limit = Number(perPage || '20');

    const data = await models.SmsRequests.find(filter)
      .sort({ createdAt: -1 })
      .limit(_limit)
      .skip((_page - 1) * _limit);

    const totalCount = await models.SmsRequests.countDocuments(filter);

    return { list: data, totalCount };
  },
};

checkPermission(engageQueries, 'engageMessages', 'engageMessagesTotalCount');
checkPermission(engageQueries, 'engageMessages', 'engageMessageCounts');
checkPermission(engageQueries, 'engageMessages', 'engageMessageDetail');
checkPermission(engageQueries, 'engageMessages', 'engageEmailPercentages');
checkPermission(engageQueries, 'engageMessages', 'engageLogs');

checkPermission(engageQueries, 'engageMessages', 'showEngagesMessages', []);

export default engageQueries;
