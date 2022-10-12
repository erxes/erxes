import { paginate } from '@erxes/api-utils/src/core';
import {
  checkPermission,
  requireLogin
} from '@erxes/api-utils/src/permissions';
import { getCustomerName } from '@erxes/api-utils/src/editorAttributeUtils';
import { IContext, IModels } from '../../connectionResolver';
import { awsRequests } from '../../trackers/engageTracker';
import { prepareAvgStats } from '../../utils';
import {
  sendContactsMessage,
  sendCoreMessage,
  sendTagsMessage
} from '../../messageBroker';
import { debug } from '../../configs';

interface IPaged {
  page?: number;
  perPage?: number;
}

interface IListArgs extends IPaged {
  kind?: string;
  status?: string;
  tag?: string;
  ids?: string;
}

interface IQuery {
  kind?: string;
}

interface IStatusQueryBuilder {
  [index: string]: boolean | string;
}

interface ICount {
  [index: string]: number;
}

interface IReportParams extends IPaged {
  customerId?: string;
  status?: string;
  searchValue?: string;
}

interface ISmsDeliveryParams extends IPaged {
  type: string;
  to?: string;
}

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
  user?
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
const countsByKind = async (models: IModels, commonSelector) => ({
  all: await count(models, commonSelector),
  auto: await count(models, { ...commonSelector, kind: 'auto' }),
  visitorAuto: await count(models, { ...commonSelector, kind: 'visitorAuto' }),
  manual: await count(models, { ...commonSelector, kind: 'manual' })
});

// count for each status type
const countsByStatus = async (
  models: IModels,
  commonSelector,
  { kind, user }: { kind: string; user }
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
      ...statusQueryBuilder('yours', user)
    })
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
    user
  }: {
    kind: string;
    status: string;
    user;
  }
): Promise<ICount> => {
  let query: any = commonSelector;

  if (kind) {
    query.kind = kind;
  }

  if (status) {
    query = { ...query, ...statusQueryBuilder(status, user) };
  }

  const tags = await sendTagsMessage({
    data: { type: 'engageMessage' },
    isRPC: true,
    subdomain,
    action: 'find'
  });

  // const response: {[name: string]: number} = {};
  const response: ICount = {};

  for (const tag of tags) {
    response[tag._id] = await count(models, {
      ...query,
      ...tagQueryBuilder(tag._id)
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
  user
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
    const object = await sendTagsMessage({
      data: { _id: tag },
      action: 'findOne',
      subdomain,
      isRPC: true
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
  engageMessageCounts(
    _root,
    { name, kind, status }: ICountParams,
    { user, commonQuerySelector, subdomain, models }: IContext
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
      user
    });
  },

  /**
   * Engage messages list
   */
  async engageMessages(
    _root,
    args: IListArgs,
    { user, commonQuerySelector, models, subdomain }: IContext
  ) {
    const query = await listQuery(subdomain, commonQuerySelector, args, user);

    return paginate(
      models.EngageMessages.find(query).sort({
        createdAt: -1
      }),
      { ...args, ids: args.ids ? args.ids.split(',') : [] }
    );
  },

  /**
   * Get one message
   */
  engageMessageDetail(_root, { _id }: { _id: string }, { models }: IContext) {
    return models.EngageMessages.findOne({ _id });
  },

  /**
   * Config detail
   */
  engagesConfigDetail(_root, _args, { models }: IContext) {
    return models.Configs.find({});
  },

  async engageReportsList(
    _root,
    params: IReportParams,
    { models, subdomain }: IContext
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
      .sort({ createdAt: -1 });

    if (!deliveryReports) {
      return { list: [], totalCount: 0 };
    }

    const totalCount = await models.DeliveryReports.countDocuments(filter);

    const modifiedList: any[] = [];

    const customerIds = deliveryReports.map(d => d.customerId);
    const customers = await sendContactsMessage({
      isRPC: true,
      subdomain,
      data: { _id: { $in: customerIds } },
      action: 'customers.find'
    });

    for (const item of deliveryReports) {
      const modifiedItem = item;

      if (item.customerId) {
        const customer = customers.find(c => c._id === item.customerId);

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
    _root,
    args: IListArgs,
    { user, commonQuerySelector, subdomain, models }: IContext
  ) {
    const query = await listQuery(subdomain, commonQuerySelector, args, user);
    return models.EngageMessages.find(query).countDocuments();
  },

  /**
   * Get all verified emails
   */
  async engageVerifiedEmails(_root, _args, { models, subdomain }: IContext) {
    const users = await sendCoreMessage({
      subdomain,
      action: 'users.find',
      isRPC: true,
      data: { isActive: true },
      defaultValue: []
    });

    const userEmails = users.map(u => u.email);
    const allVerifiedEmails: any =
      (await awsRequests.getVerifiedEmails(models)) || [];

    if (!allVerifiedEmails) {
      return [];
    }

    return allVerifiedEmails.filter(email => userEmails.includes(email));
  },

  async engageEmailPercentages(_root, _args, { models }: IContext) {
    try {
      const stats = await prepareAvgStats(models);

      return stats[0];
    } catch (e) {
      debug.error(e.message);

      return e;
    }
  },

  engageLogs(_root, args, { models }: IContext) {
    return paginate(
      models.Logs.find({ engageMessageId: args.engageMessageId }).sort({
        createdAt: -1
      }),
      { ...args }
    );
  },

  async engageSmsDeliveries(
    _root,
    params: ISmsDeliveryParams,
    { models }: IContext
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
  }
};

requireLogin(engageQueries, 'engageMessagesTotalCount');
requireLogin(engageQueries, 'engageMessageCounts');
requireLogin(engageQueries, 'engageMessageDetail');
requireLogin(engageQueries, 'engageEmailPercentages');
requireLogin(engageQueries, 'engageLogs');

checkPermission(engageQueries, 'engageMessages', 'showEngagesMessages', []);

export default engageQueries;
