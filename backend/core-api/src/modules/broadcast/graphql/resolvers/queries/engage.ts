import {
  nextOccurrence,
  occurrenceCount,
  occurrencesBetween,
  TBroadcastRecurrence,
} from '@/broadcast/utils/recurrence';
import {
  IEngageMessageDocument,
  IEngageQueryParams,
  IReportQueryParams,
  ISmsDeliveryQueryParams,
} from '@/broadcast/@types';
import { BROADCAST_APPROVAL_CONTENT_TYPES } from '@/broadcast/constants';
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
import {
  cursorPaginate,
  escapeRegExp,
  getCustomerName,
} from 'erxes-api-shared/utils';
import { IBroadcastRecipientDocument } from '@/broadcast/db/models/BroadcastRecipients';
import { generateFilter as generateContactsFilter } from '@/contacts/utils';
import { FilterQuery } from 'mongoose';

// How many contacts one search may resolve to before it stops being a filter.
const SEARCH_CUSTOMER_LIMIT = 1000;
import { IContext, IModels } from '~/connectionResolvers';

const generateFilter = async (
  models: IModels,
  params: IEngageQueryParams,
  user,
) => {
  const {
    kind,
    trigger,
    status,
    tag,
    method,
    brandId,
    fromUserId,
    searchValue,
  } = params;

  const filter: FilterQuery<IEngageQueryParams> = {};

  if (kind) {
    filter.kind = kind;
  }

  // What sets a campaign going, which is what the list shows in that column.
  // Read from the schedule rather than from `kind`, so the filter and the
  // column cannot disagree about the same campaign.
  if (trigger === 'recurring') {
    filter['scheduleDate.every'] = { $exists: true, $ne: null };
  }

  if (trigger === 'scheduled') {
    filter['scheduleDate.dateTime'] = { $exists: true, $ne: null };
    filter['scheduleDate.every'] = { $in: [null, undefined] };
  }

  if (trigger === 'manual') {
    filter['scheduleDate.every'] = { $in: [null, undefined] };
    filter['scheduleDate.dateTime'] = { $in: [null, undefined] };
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

const DAY = 24 * 60 * 60 * 1000;

/** A month view spans 42 days; a wider window than this is not a calendar. */
const MAX_CALENDAR_DAYS = 400;

/** A month denser than this cannot be read anyway. */
const MAX_CALENDAR_ENTRIES = 1000;

type TCalendarEntry = {
  engageMessageId: string;
  title?: string;
  method?: string;
  at: Date;
  state: string;
  runId?: string;
  runCount?: number;
  totalCount?: number;
};

const occurrenceKey = (engageMessageId: string, at: Date) =>
  `${engageMessageId}_${at.getTime()}`;

// A stored date rather than a pattern, so it shows even once it is behind: an
// alarm that never went off leaves a campaign waiting to be noticed.
const oneShotOccurrence = (
  campaign: { scheduleDate?: { dateTime?: string | Date } | null; runCount?: number },
  from: Date,
  to: Date,
): Date[] => {
  const dateTime = campaign.scheduleDate?.dateTime;

  if (!dateTime || campaign.runCount) {
    return [];
  }

  const at = new Date(dateTime);

  return at >= from && at <= to ? [at] : [];
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

    const page = await cursorPaginate<IEngageMessageDocument>({
      model: models.EngageMessages,
      params: { ...params, orderBy: { createdAt: -1 } },
      query,
    });

    // Resolved for the page in one query rather than per row: a locked
    // campaign has to say so in the list, and the field resolver would
    // otherwise ask the same collection once for every card.
    const lockStates = await models.ApprovalLocks.getStates({
      user,
      contentType: BROADCAST_APPROVAL_CONTENT_TYPES.CAMPAIGN,
      contentIds: page.list.map(({ _id }) => _id),
      action: 'view',
    });

    const stateByCampaignId = new Map(
      lockStates.map((state) => [state.contentId, state]),
    );

    return {
      ...page,
      list: page.list.map((campaign) => ({
        ...campaign,
        approvalLockState: stateByCampaignId.get(campaign._id),
      })),
    };
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

    const verifiedEmails = isVerified
      ? await getVerifiedSenderEmails(models, 'broadcast')
      : null;

    if (verifiedEmails || searchValue) {
      query.email = {
        ...(verifiedEmails ? { $in: verifiedEmails } : {}),
        ...(searchValue
          ? { $regex: escapeRegExp(searchValue), $options: 'i' }
          : {}),
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

  async engageBroadcastRuns(
    _root: undefined,
    { engageMessageId }: { engageMessageId: string },
    { models }: IContext,
  ) {
    const runs = await models.BroadcastRuns.find({ engageMessageId })
      .sort({ runCount: -1 })
      .lean();

    return Promise.all(
      runs.map(async (run) => {
        const grouped = await models.BroadcastRecipients.aggregate([
          { $match: { runId: run._id } },
          { $group: { _id: '$status', count: { $sum: 1 } } },
        ]);

        return {
          ...run,
          counts: grouped.reduce(
            (acc, { _id, count }) => ({ ...acc, [_id]: count }),
            {},
          ),
        };
      }),
    );
  },

  async engageBroadcastRecipients(
    _root: undefined,
    params: {
      runId: string;
      status?: string;
      searchValue?: string;
      beginDate?: Date;
      endDate?: Date;
    } & ICursorPaginateParams,
    { models, subdomain }: IContext,
  ) {
    const { runId, status, searchValue, beginDate, endDate } = params;

    const query: FilterQuery<IBroadcastRecipientDocument> = { runId };

    if (status) {
      query.status = status;
    }

    if (searchValue) {
      // The manifest holds ids, not people, so a search is answered by the
      // contacts side and joined back by id. Bounded on purpose: matching a
      // large part of the contact database is not a filter, and pushing that
      // many ids into one query is worse than saying so.
      const matched = await models.Customers.find(
        await generateContactsFilter(subdomain, { searchValue }, models),
        { _id: 1 },
      )
        .limit(SEARCH_CUSTOMER_LIMIT + 1)
        .distinct('_id');

      if (matched.length > SEARCH_CUSTOMER_LIMIT) {
        throw new Error(
          `Too many customers match "${searchValue}". Narrow the search.`,
        );
      }

      query.customerId = { $in: [...matched, searchValue] };
    }

    if (beginDate || endDate) {
      query.updatedAt = {
        ...(beginDate ? { $gte: beginDate } : {}),
        ...(endDate ? { $lte: endDate } : {}),
      };
    }

    return await cursorPaginate({
      model: models.BroadcastRecipients,
      params,
      query,
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
  async emailSenderOptions(
    _root: undefined,
    { scope }: { scope?: TEmailScope },
    { models }: IContext,
  ) {
    const options = await getEmailSenderOptions(models, scope);

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

    if (!allVerifiedEmails) {
      return userEmails;
    }

    return allVerifiedEmails.filter((email) => userEmails.includes(email));
  },
  /**
   * What a proposed recurrence would actually do.
   *
   * Asked from the form so an end date stops being an abstract date and reads
   * as "this goes out 15 times". The arithmetic stays on this side, where the
   * scheduler itself reads it, rather than being written a second time.
   */
  async engageSchedulePreview(
    _root: undefined,
    { recurrence }: { recurrence: TBroadcastRecurrence },
  ) {
    const upcoming: Date[] = [];
    let at = nextOccurrence(recurrence, new Date());

    while (at && upcoming.length < 3) {
      upcoming.push(at);
      at = nextOccurrence(recurrence, at);
    }

    return { count: occurrenceCount(recurrence), upcoming };
  },

  // What happened is in the runs; what is coming is worked out from the
  // schedules. Neither can be read from the other.
  async engageScheduleCalendar(
    _root: undefined,
    { from, to, ...params }: IEngageQueryParams & { from: Date; to: Date },
    { models, user }: IContext,
  ) {
    const start = new Date(from);
    const end = new Date(to);

    if (start.getTime() >= end.getTime()) {
      return [];
    }

    if (end.getTime() - start.getTime() > MAX_CALENDAR_DAYS * DAY) {
      throw new Error(
        `A calendar window may cover at most ${MAX_CALENDAR_DAYS} days`,
      );
    }

    const filter = await generateFilter(models, params, user);

    const runs = await models.BroadcastRuns.find(
      { startedAt: { $gte: start, $lte: end } },
      {
        engageMessageId: 1,
        runCount: 1,
        method: 1,
        status: 1,
        totalCount: 1,
        startedAt: 1,
        scheduledFor: 1,
      },
    ).lean();

    // Whatever the window's runs belong to, plus everything still scheduled.
    // The filter applies to both, so the calendar narrows the same way the
    // list does.
    const campaigns = await models.EngageMessages.find(
      {
        $and: [
          {
            $or: [
              { _id: { $in: runs.map((run) => run.engageMessageId) } },
              {
                isDraft: { $ne: true },
                scheduleDate: { $exists: true, $ne: null },
              },
            ],
          },
          filter,
        ],
      },
      { title: 1, method: 1, scheduleDate: 1, runCount: 1 },
    ).lean();

    const byId = new Map(campaigns.map((campaign) => [campaign._id, campaign]));
    const entries: TCalendarEntry[] = [];

    // An occurrence with a run behind it is that run, not a plan and a run.
    const ran = new Set<string>();

    for (const run of runs) {
      const campaign = byId.get(run.engageMessageId);

      // Filtered out, or its campaign is gone.
      if (!campaign) {
        continue;
      }

      entries.push({
        engageMessageId: run.engageMessageId,
        title: campaign.title,
        method: run.method || campaign.method,
        at: run.scheduledFor || run.startedAt,
        state: run.status,
        runId: run._id,
        runCount: run.runCount,
        totalCount: run.totalCount,
      });

      if (run.scheduledFor) {
        ran.add(occurrenceKey(run.engageMessageId, run.scheduledFor));
      }
    }

    const now = new Date();
    const projectFrom = new Date(Math.max(start.getTime(), now.getTime()));

    for (const campaign of campaigns) {
      const schedule = campaign.scheduleDate;

      if (!schedule) {
        continue;
      }

      // A repeat is only ever projected forward. Walking the pattern backwards
      // would invent occurrences from before the campaign existed; what did
      // happen is already in the runs.
      const upcoming = schedule.every
        ? occurrencesBetween(schedule, projectFrom, end, MAX_CALENDAR_ENTRIES)
        : oneShotOccurrence(campaign, start, end);

      for (const at of upcoming) {
        if (ran.has(occurrenceKey(campaign._id, at))) {
          continue;
        }

        entries.push({
          engageMessageId: campaign._id,
          title: campaign.title,
          method: campaign.method,
          at,
          state: at.getTime() < now.getTime() ? 'overdue' : 'planned',
        });
      }
    }

    return entries
      .sort((left, right) => left.at.getTime() - right.at.getTime())
      .slice(0, MAX_CALENDAR_ENTRIES);
  },
};
