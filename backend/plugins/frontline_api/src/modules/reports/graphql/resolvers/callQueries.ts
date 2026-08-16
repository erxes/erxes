import {
  CALLBACK_WINDOW_MS,
  CDR_REPORT_FIELDS,
  ICallReportArgs,
  ICdrLeg,
  buildCarrierBreakdown,
  buildCdrFilter,
  buildHeatmap,
  buildTopNumbers,
  buildVolumeSeries,
  foldLegsIntoCalls,
  summariseAgentStats,
  summariseCallbackStats,
  summariseQueueStats,
  withForwardedCallKeys,
} from '@/reports/callReportService';
import {
  buildCallHistoryEntries,
  countRepeatCallers,
  groupLegsByCall,
} from '@/reports/callHistoryService';
import {
  calculateAbandonmentRate,
  calculateAverageHandlingTime,
  calculateAverageSpeedOfAnswer,
  calculateFirstCallResolution,
  calculateOccupancyRate,
  calculateServiceLevel,
} from '@/reports/callStatistics';
import {
  deriveCallStatusFromLegs,
  getPbxDayRange,
} from '@/integrations/call/services/cdrUtils';
import { canGroup } from 'erxes-api-shared/core-modules';
import { CONVERSATION_STATUSES } from '@/inbox/db/definitions/constants';
import { markResolvers, sendTRPCMessage } from 'erxes-api-shared/utils';
import { IContext } from '~/connectionResolvers';

interface IReportIntegration {
  _id: string;
  inboxId: string;
  queues?: string[];
  operators: { userId?: string; gsUsername?: string }[];
}

const FRONTLINE_ADMIN_GROUP = 'frontline:admin';

const seesEveryQueue = async (
  subdomain: string,
  user: IContext['user'],
): Promise<boolean> =>
  Boolean(user?.isOwner) ||
  Boolean(user?.permissionGroupIds?.includes(FRONTLINE_ADMIN_GROUP)) ||
  (await canGroup(subdomain, 'showAllCallReports', user));

const EMPTY_SCORECARD = {
  callstotal: 0,
  serviceLevel: null,
  abandonment: null,
  averageSpeed: null,
  averageAnsweredTime: null,
  firstCallResolution: null,
  occupancy: null,
};

interface IReportScope {
  inboxIds: string[];
  queues: string[];
  operators: { userId?: string; gsUsername?: string }[];
  queueId?: string;
}

const resolveReportScope = async (
  models: IContext['models'],
  subdomain: string,
  user: IContext['user'],
  { integrationId, queueId }: { integrationId?: string; queueId?: string },
): Promise<IReportScope> => {
  const narrowed = queueId && queueId !== 'all' ? String(queueId) : undefined;

  const selector: Record<string, unknown> = {};

  if (integrationId) {
    selector.inboxId = String(integrationId);
  } else if (narrowed) {
    selector.queues = narrowed;
  }

  if (!(await seesEveryQueue(subdomain, user))) {
    selector['operators.userId'] = user?._id;
  }

  const integrations = await models.CallIntegrations.find(
    selector,
  ).lean<IReportIntegration[]>();

  const queues = [
    ...new Set(
      integrations.flatMap(({ queues: owned }) => (owned ?? []).map(String)),
    ),
  ].filter(Boolean);

  const empty = { inboxIds: [], queues: [], operators: [] };

  if (narrowed && !queues.includes(narrowed)) {
    return empty;
  }

  return {
    inboxIds: integrations
      .map(({ inboxId }) => String(inboxId))
      .filter(Boolean),
    queues,
    operators: integrations.flatMap(({ operators }) => operators ?? []),
    queueId: narrowed,
  };
};

const inboxScopeFilter = ({ inboxIds }: IReportScope): Record<string, unknown> =>
  inboxIds.length === 1
    ? { inboxIntegrationId: inboxIds[0] }
    : { inboxIntegrationId: { $in: inboxIds } };

const operatorUserIdByExtension = ({
  operators,
}: IReportScope): Map<string, string> =>
  new Map(
    operators
      .filter(({ gsUsername, userId }) => gsUsername && userId)
      .map(({ gsUsername, userId }) => [String(gsUsername), String(userId)]),
  );

export const reportCallQueries = {
  async callReportIntegrations(
    _args,
    _params,
    { models, user, subdomain }: IContext,
  ) {
    const selector = (await seesEveryQueue(subdomain, user))
      ? {}
      : { 'operators.userId': user?._id };

    return models.CallIntegrations.find(selector, {
      _id: 1,
      inboxId: 1,
      phone: 1,
      queues: 1,
    })
      .sort({ phone: 1 })
      .lean<
        { _id: string; inboxId: string; phone?: string; queues?: string[] }[]
      >();
  },
  async callGetQueueStats(
    _args,
    { startDate, endDate, integrationId, queueId, direction }: ICallReportArgs,
    { models, user, subdomain }: IContext,
  ) {
    const scope = await resolveReportScope(models, subdomain, user, {
      integrationId,
      queueId,
    });

    if (!scope.inboxIds.length) {
      return [];
    }

    const cdrs = await models.CallCdrs.find({
      ...buildCdrFilter({
        startDate,
        endDate,
        queueId: scope.queueId,
        direction,
      }),
      ...inboxScopeFilter(scope),
    })
      .select(CDR_REPORT_FIELDS)
      .lean<ICdrLeg[]>();

    const allowedQueues = scope.queueId ? [scope.queueId] : scope.queues;

    const calls = foldLegsIntoCalls(cdrs).filter(
      (call) => call.queue && allowedQueues.includes(call.queue),
    );

    return summariseQueueStats(calls);
  },

  async callGetAgentStats(
    _args,
    {
      startDate,
      endDate,
      integrationId,
      queueId,
      agentId = null,
      direction,
    }: ICallReportArgs & { agentId?: string | null },
    { models, user, subdomain }: IContext,
  ) {
    const scope = await resolveReportScope(models, subdomain, user, {
      integrationId,
      queueId,
    });

    if (!scope.inboxIds.length) {
      return [];
    }

    const userIdByExtension = operatorUserIdByExtension(scope);
    const agentExtensions = new Set(userIdByExtension.keys());

    const wantsInbound =
      !direction || direction === 'all' || direction === 'Inbound';
    const wantsOutbound =
      !direction || direction === 'all' || direction === 'Outbound';

    const [inboundCdrs, outboundCdrs] = await Promise.all([
      wantsInbound
        ? models.CallCdrs.find({
            ...buildCdrFilter({
              startDate,
              endDate,
              queueId: scope.queueId,
              direction: 'Inbound',
            }),
            ...inboxScopeFilter(scope),
          })
            .select(CDR_REPORT_FIELDS)
            .lean<ICdrLeg[]>()
        : [],

      wantsOutbound
        ? models.CallCdrs.find({
            ...buildCdrFilter({
              startDate,
              endDate,
              direction: 'Outbound',
              includeForwarded: true,
            }),
            ...inboxScopeFilter(scope),
          })
            .select(CDR_REPORT_FIELDS)
            .lean<ICdrLeg[]>()
        : [],
    ]);

    const stats = summariseAgentStats(
      [...inboundCdrs, ...outboundCdrs],
      agentId,
      agentExtensions,
    );

    const operatorUserIds = [
      ...new Set(
        stats
          .map(({ agent }) => userIdByExtension.get(agent))
          .filter((id): id is string => Boolean(id)),
      ),
    ];

    const operators: {
      _id: string;
      details?: { fullName?: string };
      email?: string;
    }[] = operatorUserIds.length
      ? await sendTRPCMessage({
          subdomain,
          pluginName: 'core',
          method: 'query',
          module: 'users',
          action: 'find',
          input: { query: { _id: { $in: operatorUserIds } } },
        })
      : [];

    const nameByUserId = new Map(
      (operators ?? []).map((operator) => [
        String(operator._id),
        operator.details?.fullName || operator.email || '',
      ]),
    );

    return stats.map((stat) => ({
      ...stat,
      agentName:
        nameByUserId.get(userIdByExtension.get(stat.agent) ?? '') || null,
    }));
  },

  async getCallbackStats(
    _args,
    { startDate, endDate, integrationId, queueId }: ICallReportArgs,
    { models, user, subdomain }: IContext,
  ) {
    const scope = await resolveReportScope(models, subdomain, user, {
      integrationId,
      queueId,
    });

    if (!scope.inboxIds.length) {
      return [];
    }

    const inboundCdrs = await models.CallCdrs.find({
      ...buildCdrFilter({
        startDate,
        endDate,
        queueId: scope.queueId,
        direction: 'Inbound',
      }),
      ...inboxScopeFilter(scope),
    })
      .select(CDR_REPORT_FIELDS)
      .lean<ICdrLeg[]>();

    const outboundCdrs = await models.CallCdrs.find({
      ...buildCdrFilter({
        startDate,
        endDate: new Date(
          new Date(endDate).getTime() + CALLBACK_WINDOW_MS,
        ).toISOString(),
        direction: 'Outbound',
      }),
      ...inboxScopeFilter(scope),
    })
      .select(CDR_REPORT_FIELDS)
      .lean<ICdrLeg[]>();

    return summariseCallbackStats(
      foldLegsIntoCalls(inboundCdrs),
      foldLegsIntoCalls(outboundCdrs),
      scope.queueId || 'all',
    );
  },

  async callKpiScorecard(
    _args,
    { startDate, endDate, integrationId, queueId, direction }: ICallReportArgs,
    { models, user, subdomain }: IContext,
  ) {
    const scope = await resolveReportScope(models, subdomain, user, {
      integrationId,
      queueId,
    });

    if (!scope.inboxIds.length) {
      return EMPTY_SCORECARD;
    }

    const wantsInbound =
      !direction || direction === 'all' || direction === 'Inbound';
    const wantsOutbound =
      !direction || direction === 'all' || direction === 'Outbound';

    const [inboundCdrs, outboundCdrs] = await Promise.all([
      wantsInbound
        ? models.CallCdrs.find({
            ...buildCdrFilter({
              startDate,
              endDate,
              queueId: scope.queueId,
              direction: 'Inbound',
            }),
            ...inboxScopeFilter(scope),
          })
            .select(CDR_REPORT_FIELDS)
            .lean<ICdrLeg[]>()
        : [],

      wantsOutbound
        ? models.CallCdrs.find({
            ...buildCdrFilter({ startDate, endDate, direction: 'Outbound' }),
            ...inboxScopeFilter(scope),
          })
            .select(CDR_REPORT_FIELDS)
            .lean<ICdrLeg[]>()
        : [],
    ]);

    const cdrs = [...inboundCdrs, ...outboundCdrs];

    const [
      serviceLevel,
      abandonment,
      averageAnsweredTime,
      firstCallResolution,
      occupancy,
      averageSpeed,
    ] = await Promise.all([
      calculateServiceLevel(cdrs),
      calculateAbandonmentRate(cdrs),
      calculateAverageHandlingTime(cdrs),
      calculateFirstCallResolution(cdrs),
      calculateOccupancyRate(cdrs),
      calculateAverageSpeedOfAnswer(cdrs),
    ]);

    return {
      callstotal: new Set(cdrs.map(({ uniqueid }) => uniqueid)).size,
      serviceLevel,
      abandonment,
      averageSpeed,
      averageAnsweredTime,
      firstCallResolution,
      occupancy,
    };
  },

  async callVolumeSeries(
    _args,
    { startDate, endDate, integrationId, queueId, direction }: ICallReportArgs,
    { models, user, subdomain }: IContext,
  ) {
    const scope = await resolveReportScope(models, subdomain, user, {
      integrationId,
      queueId,
    });

    if (!scope.inboxIds.length) {
      return [];
    }

    const wantsInbound =
      !direction || direction === 'all' || direction === 'Inbound';
    const wantsOutbound =
      !direction || direction === 'all' || direction === 'Outbound';

    const [inboundCdrs, outboundCdrs] = await Promise.all([
      wantsInbound
        ? models.CallCdrs.find({
            ...buildCdrFilter({
              startDate,
              endDate,
              queueId: scope.queueId,
              direction: 'Inbound',
            }),
            ...inboxScopeFilter(scope),
          })
            .select(CDR_REPORT_FIELDS)
            .lean<ICdrLeg[]>()
        : [],

      wantsOutbound
        ? models.CallCdrs.find({
            ...buildCdrFilter({ startDate, endDate, direction: 'Outbound' }),
            ...inboxScopeFilter(scope),
          })
            .select(CDR_REPORT_FIELDS)
            .lean<ICdrLeg[]>()
        : [],
    ]);

    return buildVolumeSeries(
      foldLegsIntoCalls([...inboundCdrs, ...outboundCdrs]),
    );
  },

  async callCarrierBreakdown(
    _args,
    { startDate, endDate, integrationId, queueId, direction }: ICallReportArgs,
    { models, user, subdomain }: IContext,
  ) {
    const scope = await resolveReportScope(models, subdomain, user, {
      integrationId,
      queueId,
    });

    if (!scope.inboxIds.length) {
      return [];
    }

    const cdrs = await models.CallCdrs.find({
      ...buildCdrFilter({
        startDate,
        endDate,
        queueId: scope.queueId,
        direction,
      }),
      ...inboxScopeFilter(scope),
    })
      .select(CDR_REPORT_FIELDS)
      .lean<ICdrLeg[]>();

    return buildCarrierBreakdown(foldLegsIntoCalls(cdrs));
  },

  async callHeatmap(
    _args,
    { startDate, endDate, integrationId, queueId, direction }: ICallReportArgs,
    { models, user, subdomain }: IContext,
  ) {
    const scope = await resolveReportScope(models, subdomain, user, {
      integrationId,
      queueId,
    });

    if (!scope.inboxIds.length) {
      return [];
    }

    const cdrs = await models.CallCdrs.find({
      ...buildCdrFilter({
        startDate,
        endDate,
        queueId: scope.queueId,
        direction,
      }),
      ...inboxScopeFilter(scope),
    })
      .select(CDR_REPORT_FIELDS)
      .lean<ICdrLeg[]>();

    return buildHeatmap(foldLegsIntoCalls(cdrs));
  },

  async callTopNumbers(
    _args,
    {
      startDate,
      endDate,
      integrationId,
      queueId,
      direction,
      limit = 12,
    }: ICallReportArgs & { limit?: number },
    { models, user, subdomain }: IContext,
  ) {
    const scope = await resolveReportScope(models, subdomain, user, {
      integrationId,
      queueId,
    });

    if (!scope.inboxIds.length) {
      return [];
    }

    const cdrs = await models.CallCdrs.find({
      ...buildCdrFilter({
        startDate,
        endDate,
        queueId: scope.queueId,
        direction,
      }),
      ...inboxScopeFilter(scope),
    })
      .select(CDR_REPORT_FIELDS)
      .lean<ICdrLeg[]>();

    return buildTopNumbers(foldLegsIntoCalls(cdrs), limit);
  },

  async callTodayStatistics(
    _root,
    { queue }: { queue: string },
    { models }: IContext,
  ) {
    const DEFAULT_VALUE = 0;

    try {
      const { dateFrom, dateTo } = getPbxDayRange();

      const todayCdrs = await models.CallCdrs.find({
        actionType: { $regex: queue },
        start: {
          $gte: dateFrom,
          $lt: dateTo,
        },
      });

      const [
        serviceLevel,
        firstCallResolution,
        averageSpeed,
        averageAnsweredTime,
      ] = await Promise.all([
        calculateServiceLevel(todayCdrs),
        calculateFirstCallResolution(todayCdrs),
        calculateAverageSpeedOfAnswer(todayCdrs),
        calculateAverageHandlingTime(todayCdrs),
      ]);

      return {
        serviceLevel: serviceLevel || DEFAULT_VALUE,
        firstCallResolution: firstCallResolution || DEFAULT_VALUE,
        averageSpeed: averageSpeed || DEFAULT_VALUE,
        averageAnsweredTime: averageAnsweredTime || DEFAULT_VALUE,
      };
    } catch (error) {
      console.error('Error in callTodayStatistics:', error);

      return {
        serviceLevel: DEFAULT_VALUE,
        firstCallResolution: DEFAULT_VALUE,
        averageSpeed: DEFAULT_VALUE,
        averageAnsweredTime: DEFAULT_VALUE,
        callstotal: DEFAULT_VALUE,
      };
    }
  },

  async callCalculateServiceLevel(
    _root,
    {
      queue,
      startDate,
      endDate,
      direction,
    }: {
      queue: string;
      startDate: string;
      endDate: string;
      direction?: string;
    },
    { models }: IContext,
  ) {
    const filter: any = {
      actionType: { $regex: queue },
      start: {
        $gte: new Date(startDate),
        $lt: new Date(endDate),
      },
    };

    if (direction) {
      filter.userfield = direction;
    }

    const todyCdrs = await models.CallCdrs.find(filter);

    return calculateServiceLevel(todyCdrs);
  },
  async callCalculateFirstCallResolution(
    _root,
    {
      queue,
      startDate,
      endDate,
      direction,
    }: {
      queue: string;
      startDate: string;
      endDate: string;
      direction?: string;
    },
    { models }: IContext,
  ) {
    const filter: any = {
      actionType: { $regex: queue },
      start: {
        $gte: new Date(startDate),
        $lt: new Date(endDate),
      },
    };

    if (direction) {
      filter.userfield = direction;
    }

    const todyCdrs = await models.CallCdrs.find(filter);

    return calculateFirstCallResolution(todyCdrs);
  },
  async callCalculateAbandonmentRate(
    _root,
    {
      queue,
      startDate,
      endDate,
      direction,
    }: {
      queue: string;
      startDate: string;
      endDate: string;
      direction?: string;
    },
    { models }: IContext,
  ) {
    const filter: any = {
      actionType: { $regex: queue },
      start: {
        $gte: new Date(startDate),
        $lt: new Date(endDate),
      },
    };

    if (direction) {
      filter.userfield = direction;
    }

    const todyCdrs = await models.CallCdrs.find(filter);

    return calculateAbandonmentRate(todyCdrs);
  },

  async callCalculateAverageSpeedOfAnswer(
    _root,
    {
      queue,
      startDate,
      endDate,
      direction,
    }: {
      queue: string;
      startDate: string;
      endDate: string;
      direction?: string;
    },
    { models }: IContext,
  ) {
    const filter: any = {
      actionType: { $regex: queue },
      start: {
        $gte: new Date(startDate),
        $lt: new Date(endDate),
      },
    };

    if (direction) {
      filter.userfield = direction;
    }

    const todyCdrs = await models.CallCdrs.find(filter);

    return calculateAverageSpeedOfAnswer(todyCdrs);
  },

  async callCalculateAverageHandlingTime(
    _root,
    {
      queue,
      startDate,
      endDate,
      direction,
    }: {
      queue: string;
      startDate: string;
      endDate: string;
      direction?: string;
    },
    { models }: IContext,
  ) {
    const filter: any = {
      actionType: { $regex: queue },
      start: {
        $gte: new Date(startDate),
        $lt: new Date(endDate),
      },
    };

    if (direction) {
      filter.userfield = direction;
    }

    const todyCdrs = await models.CallCdrs.find(filter);

    return calculateAverageHandlingTime(todyCdrs);
  },

  async callCalculateOccupancyRate(
    _root,
    {
      queue,
      startDate,
      endDate,
      direction,
    }: {
      queue: string;
      startDate: string;
      endDate: string;
      direction?: string;
    },
    { models }: IContext,
  ) {
    const filter: any = {
      actionType: { $regex: queue },
      start: {
        $gte: new Date(startDate),
        $lt: new Date(endDate),
      },
    };

    if (direction) {
      filter.userfield = direction;
    }

    const todyCdrs = await models.CallCdrs.find(filter);

    return calculateOccupancyRate(todyCdrs);
  },

  async callGetOperatorStats(_, { startDate, endDate }, { models }: IContext) {
    return await models.CallCdrs.aggregate([
      {
        $match: {
          start: { $gte: new Date(startDate), $lte: new Date(endDate) },
        },
      },
      {
        $group: {
          _id: {
            agent: {
              $cond: [{ $eq: ['$userfield', 'Outbound'] }, '$src', '$dst'],
            },
          },
          totalIncoming: {
            $sum: { $cond: [{ $eq: ['$userfield', 'Inbound'] }, 1, 0] },
          },
          incomingAnswered: {
            $sum: {
              $cond: [
                {
                  $and: [
                    { $eq: ['$userfield', 'Inbound'] },
                    { $eq: ['$disposition', 'ANSWERED'] },
                  ],
                },
                1,
                0,
              ],
            },
          },
          incomingMissed: {
            $sum: {
              $cond: [
                {
                  $and: [
                    { $eq: ['$userfield', 'Inbound'] },
                    { $ne: ['$disposition', 'ANSWERED'] },
                  ],
                },
                1,
                0,
              ],
            },
          },
          totalOutgoing: {
            $sum: { $cond: [{ $eq: ['$userfield', 'Outbound'] }, 1, 0] },
          },
          outgoingAnswered: {
            $sum: {
              $cond: [
                {
                  $and: [
                    { $eq: ['$userfield', 'Outbound'] },
                    { $eq: ['$disposition', 'ANSWERED'] },
                  ],
                },
                1,
                0,
              ],
            },
          },
          totalTalkTime: { $sum: '$billsec' },
        },
      },
      {
        $addFields: {
          cleanAgentId: {
            $trim: { input: { $toString: '$_id.agent' } },
          },
        },
      },
      {
        $match: {
          cleanAgentId: { $regex: '^[0-9]{3,4}$' },
        },
      },
      {
        $project: {
          agent: '$cleanAgentId',
          totalIncoming: 1,
          incomingAnswered: 1,
          incomingMissed: 1,
          totalOutgoing: 1,
          outgoingAnswered: 1,
          totalTalkTime: 1,
          _id: 0,
        },
      },
    ]);
  },

  async callHistoryList(
    _args,
    {
      startDate,
      endDate,
      integrationId,
      queueId,
      direction,
      outcome,
      agentExtension,
      resolution,
      searchValue,
      skip = 0,
      limit = 25,
    }: ICallReportArgs & {
      outcome?: string;
      agentExtension?: string;
      resolution?: string;
      searchValue?: string;
      skip?: number;
      limit?: number;
    },
    { models, user, subdomain }: IContext,
  ) {
    const scope = await resolveReportScope(models, subdomain, user, {
      integrationId,
      queueId,
    });

    if (!scope.inboxIds.length) {
      return { entries: [], totalCount: 0, callerCount: 0, agents: [] };
    }

    const wantsInbound =
      !direction || direction === 'all' || direction === 'Inbound';
    const wantsOutbound =
      !direction || direction === 'all' || direction === 'Outbound';

    const [inboundCdrs, outboundCdrs] = await Promise.all([
      wantsInbound
        ? models.CallCdrs.find({
            ...buildCdrFilter({
              startDate,
              endDate,
              queueId: scope.queueId,
              direction: 'Inbound',
            }),
            ...inboxScopeFilter(scope),
          })
            .select(CDR_REPORT_FIELDS)
            .lean<ICdrLeg[]>()
        : [],

      wantsOutbound
        ? models.CallCdrs.find({
            ...buildCdrFilter({
              startDate,
              endDate,
              direction: 'Outbound',
              includeForwarded: true,
            }),
            ...inboxScopeFilter(scope),
          })
            .select(CDR_REPORT_FIELDS)
            .lean<ICdrLeg[]>()
        : [],
    ]);

    const legs = withForwardedCallKeys([...inboundCdrs, ...outboundCdrs]);
    const legsByCall = groupLegsByCall(legs);

    const userIdByExtension = operatorUserIdByExtension(scope);

    let calls = foldLegsIntoCalls(legs, new Set(userIdByExtension.keys()));

    const outcomeByCall = new Map(
      calls.map(({ uniqueid }) => [
        uniqueid,
        deriveCallStatusFromLegs(legsByCall.get(uniqueid) ?? []),
      ]),
    );

    calls = calls.filter((call) => outcomeByCall.get(call.uniqueid) !== 'IVR');

    const repeats = countRepeatCallers(calls);

    const agentExtensionsInRange = [
      ...new Set(calls.map(({ agent }) => agent).filter(Boolean)),
    ] as string[];

    if (outcome && outcome !== 'all') {
      calls = calls.filter(
        (call) => outcomeByCall.get(call.uniqueid) === outcome,
      );
    }

    if (agentExtension && agentExtension !== 'all') {
      calls = calls.filter((call) => call.agent === agentExtension);
    }

    if (resolution === 'resolved' || resolution === 'unresolved') {
      const conversationIds = [
        ...new Set(
          calls.map(({ conversationId }) => conversationId).filter(Boolean),
        ),
      ] as string[];

      const closedIds = new Set(
        (
          await models.Conversations.find(
            {
              _id: { $in: conversationIds },
              status: CONVERSATION_STATUSES.CLOSED,
            },
            { _id: 1 },
          ).lean<{ _id: string }[]>()
        ).map(({ _id }) => String(_id)),
      );

      calls = calls.filter((call) => {
        const isResolved = Boolean(
          call.conversationId && closedIds.has(call.conversationId),
        );
        return resolution === 'resolved' ? isResolved : !isResolved;
      });
    }

    if (searchValue) {
      const needle = searchValue.replace(/[^0-9]/g, '');
      if (needle) {
        calls = calls.filter((call) =>
          (call.customerPhone ?? '').includes(needle),
        );
      }
    }

    calls.sort((a, b) => (b.start?.getTime() ?? 0) - (a.start?.getTime() ?? 0));

    const page = calls.slice(skip, skip + limit);

    const phones = [
      ...new Set(
        page.map(({ customerPhone }) => customerPhone).filter(Boolean),
      ),
    ] as string[];

    const extensions = agentExtensionsInRange;

    const operatorUserIds = [
      ...new Set(
        extensions
          .map((extension) => userIdByExtension.get(extension))
          .filter((id): id is string => Boolean(id)),
      ),
    ];

    const [contacts, operators] = await Promise.all([
      phones.length
        ? sendTRPCMessage({
            subdomain,
            pluginName: 'core',
            method: 'query',
            module: 'customers',
            action: 'find',
            input: {
              query: {
                $or: [
                  { primaryPhone: { $in: phones } },
                  { phones: { $in: phones } },
                ],
              },
              fields: {
                _id: 1,
                firstName: 1,
                lastName: 1,
                primaryPhone: 1,
                phones: 1,
              },
            },
          })
        : [],
      operatorUserIds.length
        ? sendTRPCMessage({
            subdomain,
            pluginName: 'core',
            method: 'query',
            module: 'users',
            action: 'find',
            input: { query: { _id: { $in: operatorUserIds } } },
          })
        : [],
    ]);

    const customerNamesByPhone = new Map<
      string,
      { _id: string; name: string }
    >();
    for (const contact of (contacts ?? []) as any[]) {
      const name =
        [contact.firstName, contact.lastName]
          .filter(Boolean)
          .join(' ')
          .trim() || '';
      if (!name) continue;
      for (const phone of [contact.primaryPhone, ...(contact.phones ?? [])]) {
        if (phone && !customerNamesByPhone.has(String(phone))) {
          customerNamesByPhone.set(String(phone), {
            _id: String(contact._id),
            name,
          });
        }
      }
    }

    const nameByUserId = new Map<string, string>(
      ((operators ?? []) as any[]).map((operator) => [
        String(operator._id),
        operator.details?.fullName || operator.email || '',
      ]),
    );

    const agentNamesByExtension = new Map<string, string>(
      extensions
        .map((extension): [string, string] => [
          extension,
          nameByUserId.get(userIdByExtension.get(extension) ?? '') || '',
        ])
        .filter(([, name]) => Boolean(name)),
    );

    return {
      entries: buildCallHistoryEntries({
        calls: page,
        legsByCall,
        outcomeByCall,
        repeats,
        customerNamesByPhone,
        agentNamesByExtension,
      }),
      totalCount: calls.length,

      callerCount: new Set(
        calls.map(({ customerPhone }) => customerPhone).filter(Boolean),
      ).size,
      agents: agentExtensionsInRange
        .map((extension) => ({
          extension,
          name: agentNamesByExtension.get(extension) ?? null,
        }))
        .sort((a, b) =>
          (a.name ?? a.extension).localeCompare(b.name ?? b.extension),
        ),
    };
  },
};

markResolvers(reportCallQueries, {
  wrapperConfig: {
    skipPermission: true,
  },
});
