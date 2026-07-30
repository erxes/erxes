import {
  IEngageQueryParams,
  IReportQueryParams,
  ISmsDeliveryQueryParams,
} from '@/broadcast/@types';
import {
  countsByKind,
  countsByStatus,
  countsByTag,
  prepareAvgStats,
} from '@/broadcast/utils';
import {
  getEmailSenderOptions,
  getVerifiedSenderEmails,
} from '~/utils/email/senders';
import { TEmailScope } from '~/utils/email/scope';
import { ICursorPaginateParams, IUser } from 'erxes-api-shared/core-types';
import { cursorPaginate, getCustomerName } from 'erxes-api-shared/utils';
import { FilterQuery } from 'mongoose';
import { IContext, IModels } from '~/connectionResolvers';

const generateFilter = async (
  models: IModels,
  params: IEngageQueryParams,
  user,
) => {
  const { kind, status, tag, method, brandId, fromUserId, searchValue } =
    params;

  const filter: FilterQuery<IEngageQueryParams> = {};

  if (kind) {
    filter.kind = kind;
  }

  if (method) {
    filter.method = method;
  }

  if (fromUserId) {
    filter.fromUserId = fromUserId;
  }

  if (brandId) {
    filter.$or = [
      { brandIds: { $in: [brandId] } },
      { 'messenger.brandId': brandId },
    ];
  }

  if (searchValue) {
    filter.title = new RegExp(`.*${searchValue}.*`, 'i');
  }

  if (status === 'sent') {
    filter.$and = [{ runCount: { $gt: 0 } }, { kind: 'manual' }];
  }

  if (status === 'notSent') {
    filter.$and = [
      { isDraft: { $in: [null, false] } },
      { runCount: { $lte: 0 } },
      { kind: 'manual' },
    ];
  }

  if (status === 'draft') {
    filter.isDraft = true;
  }

  if (status === 'paused') {
    filter.$and = [
      { isLive: false },
      { kind: 'auto' },
      { isDraft: { $in: [null, false] } },
    ];
  }

  if (status === 'sending') {
    filter.$and = [{ kind: 'auto' }, { isLive: true }, { isDraft: false }];
  }

  if (tag) {
    const object = await models.Tags.findOne({ _id: tag });

    const relatedIds = object?.relatedIds || [];

    filter.tagIds = { $in: [tag, ...relatedIds] };
  }

  return filter;
};

export const engageQueries = {
  /**
   * Group engage messages counts by kind, status, tag
   */
  async engageMessageCounts(
    _root: undefined,
    {
      name,
      kind,
      status,
    }: {
      name: string;
      kind: string;
      status: string;
    },
    { user, models }: IContext,
  ) {
    if (name === 'kind') {
      return countsByKind(models);
    }

    if (name === 'status') {
      return countsByStatus(models, { kind, user });
    }

    return countsByTag(models, {
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
    params: IEngageQueryParams,
    { user, models }: IContext,
  ) {
    const query = await generateFilter(models, params, user);

    return cursorPaginate({
      model: models.EngageMessages,
      params: { ...params, orderBy: { createdAt: -1 } },
      query,
    });
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
  async engagesConfigDetail(
    _root: undefined,
    _args: undefined,
    { models }: IContext,
  ) {
    return models.Configs.find({});
  },

  async engageReportsList(
    _root: undefined,
    params: IReportQueryParams,
    { models }: IContext,
  ) {
    const { customerId, status, searchValue } = params;

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
      .sort({ createdAt: -1 })
      .lean();

    if (!deliveryReports) {
      return { list: [], totalCount: 0 };
    }

    const totalCount = await models.DeliveryReports.countDocuments(filter);

    const modifiedList: any[] = [];

    const customerIds = deliveryReports.map((d) => d.customerId);

    const customers = await models.Customers.find({
      _id: { $in: customerIds },
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
    args: IEngageQueryParams,
    { user, models }: IContext,
  ) {
    const query = await generateFilter(models, args, user);

    return models.EngageMessages.find(query).countDocuments();
  },

  /**
   * Get all verified members
   */
  async engageMembers(
    _root: undefined,
    params: {
      searchValue: string;
      isVerified: boolean;
    } & ICursorPaginateParams,
    { models }: IContext,
  ) {
    const { isVerified, searchValue } = params;

    const query: FilterQuery<IUser> = {
      isActive: true,
    };

    // `null` means the configured provider keeps no sender registry (plain
    // SMTP), in which case every member is an eligible sender.
    const verifiedEmails = isVerified
      ? await getVerifiedSenderEmails(models, 'broadcast')
      : null;

    if (verifiedEmails) {
      query.email = { $in: verifiedEmails };
    }

    if (searchValue) {
      query.email = { $regex: searchValue, $options: '$i' };
    }

    if (verifiedEmails && searchValue) {
      query.email = {
        $in: verifiedEmails,
        $regex: searchValue,
        $options: 'i',
      };
    }

    return await cursorPaginate({
      model: models.Users,
      params,
      query,
    });
  },

  async engageEmailPercentages(
    _root: undefined,
    _args: undefined,
    { models }: IContext,
  ) {
    try {
      const stats = await prepareAvgStats(models);

      return stats[0];
    } catch (e) {
      console.log(e.message);

      return e;
    }
  },

  async engageBroadcastTraces(
    _root: undefined,
    { engageMessageId }: { engageMessageId: string },
    { models }: IContext,
  ) {
    return models.BroadcastTraces.find({ engageMessageId }).sort({
      createdAt: -1,
    });
  },

  async engageSmsDeliveries(
    _root: undefined,
    params: ISmsDeliveryQueryParams,
    { models }: IContext,
  ) {
    const { type, to } = params;

    if (type !== 'campaign') {
      return { status: 'error', message: `Invalid parameter type: "${type}"` };
    }

    const filter: any = {};

    if (to && !(to === 'undefined' || to === 'null')) {
      filter.to = { $regex: to, $options: '$i' };
    }

    const data = await models.SmsRequests.find(filter).sort({ createdAt: -1 });

    const totalCount = await models.SmsRequests.countDocuments(filter);

    return { list: data, totalCount };
  },
  /**
   * Config-only answer about the org's mail setup. Anything needing the
   * provider's API is resolved lazily by the `EmailSenderOptions` field
   * resolvers, so a caller that only wants to know which provider is configured
   * never triggers an outbound request.
   */
  async emailSenderOptions(
    _root: undefined,
    { scope }: { scope?: TEmailScope },
    { models }: IContext,
  ) {
    const options = await getEmailSenderOptions(models, scope);

    // Carried onto the root so the field resolvers reach the same credentials.
    return { ...options, _scope: scope };
  },

  async engageVerifiedEmails(
    _root: undefined,
    _args: undefined,
    { models }: IContext,
  ) {
    const users = await models.Users.find({
      isActive: true,
    });
    const userEmails = users?.map((u) => u.email);
    const allVerifiedEmails = await getVerifiedSenderEmails(
      models,
      'broadcast',
    );

    // `null` means the configured provider keeps no sender registry (plain
    // SMTP), in which case every member's address is usable as a sender.
    if (!allVerifiedEmails) {
      return userEmails;
    }

    return allVerifiedEmails.filter((email) => userEmails.includes(email));
  },
};
