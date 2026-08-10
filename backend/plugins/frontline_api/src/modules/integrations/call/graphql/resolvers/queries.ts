import { IMessageDocument } from '@/inbox/@types/conversationMessages';
import { INotesParams } from '@/integrations/call/@types/conversationNotes';
import {
  ICallHistory,
  ICallHistoryFilterOptions,
} from '@/integrations/call/@types/histories';
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
} from '@/integrations/call/services/callReportService';
import {
  averageSpeedOfAnswer,
  deriveCallStatusFromLegs,
  getPbxDayRange,
  selectRelevantCdr,
} from '@/integrations/call/services/cdrUtils';
import {
  calculateAbandonmentRate,
  calculateAverageHandlingTime,
  calculateAverageSpeedOfAnswer,
  calculateFirstCallResolution,
  calculateOccupancyRate,
  calculateServiceLevel,
} from '@/integrations/call/statistics';
import {
  mapCdrToCallHistory,
  mapSessionToCallHistory,
  sendToGrandStream,
} from '@/integrations/call/utils';
import { markResolvers, sendTRPCMessage } from 'erxes-api-shared/utils';
import { IContext } from '~/connectionResolvers';
import redis from '../../redlock';

const callQueries = {
  async callsIntegrationDetail(
    _root,
    { integrationId },
    { models, user }: IContext,
  ) {
    if (!user?._id) {
      throw new Error('Login required');
    }

    const integration = await models.CallIntegrations.findOne({
      inboxId: integrationId,
    }).lean();

    if (!integration) {
      return null;
    }

    const { token, ...safe } = integration as any;
    return safe;
  },

  async callUserIntegrations(_root, _args, { models, user }: IContext) {
    // const isAdmin =
    //   user.isOwner || user.permissionGroupIds?.includes('frontline:admin');
    // return models.CallIntegrations.getIntegrations(user._id, isAdmin);
    const res = models.CallIntegrations.getIntegrations(user._id);
    return res;
  },

  async callsCustomerDetail(_root, { customerPhone }, { subdomain }: IContext) {
    const customer = await sendTRPCMessage({
      subdomain,

      pluginName: 'core',
      method: 'query',
      module: 'customers',
      action: 'findOne',
      input: { query: { customerPrimaryPhone: customerPhone } },
    });

    return customer;
  },

  async callHistories(
    _root,
    params: ICallHistoryFilterOptions,
    { models, user }: IContext,
  ) {
    return models.CallHistory.getCallHistories(params, user);
  },
  async callHistoriesTotalCount(
    _root,
    params: ICallHistoryFilterOptions,
    { models, user }: IContext,
  ) {
    return models.CallHistory.getHistoriesCount(params, user);
  },

  async callsGetConfigs(_root, _args, { models }: IContext) {
    return models.CallConfigs.find({});
  },

  async callGetAgentStatus(_root, _args, { models, user }: IContext) {
    const operator = await models.CallOperators.findOne({ userId: user._id });
    if (operator) {
      return operator.status;
    }
    return 'UnAvailable';
  },

  async callExtensionList(
    _root,
    { integrationId },
    { models, user }: IContext,
  ) {
    // const isAdmin =
    //   user.isOwner || user.permissionGroupIds?.includes('frontline:admin');
    const integration = await models.CallIntegrations.getIntegration(
      user._id,
      integrationId,
    );
    if (!integration) {
      throw new Error('Integration not found');
    }
    const queueData = (await sendToGrandStream(
      models,
      {
        path: 'api',
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        data: {
          request: {
            action: 'listAccount',
            item_num: '50',
            options: 'extension,fullname,status',
            page: '1',
            sidx: 'extension',
            sord: 'asc',
          },
        },
        integrationId: integrationId,
        retryCount: 3,
        isConvertToJson: true,
        isAddExtention: false,
      },
      user,
    )) as any;
     console.log(queueData, 'extension list queueData');

    if (queueData?.response) {
      const { account } = queueData.response;

      if (account) {
        const gsUsernames = integration.operators.map(
          (operator) => operator.gsUsername,
        );

        const matchedAgents = account.filter(
          (agent) =>
            gsUsernames.includes(agent.extension) &&
            agent.status !== 'Unavailable',
        );

        return matchedAgents;
      }
      return [];
    }
    return 'request failed';
  },
  async callQueueList(_root, { integrationId }, { models, user }: IContext) {
    const integration = await models.CallIntegrations.getIntegration(
      user._id,
      integrationId,
    );

    // `CallQueueStatistics` is a cache of live PBX counters and only exists for
    // queues the PBX has reported on, so the queues configured on the
    // integration are the authoritative list.
    const statistics = await models.CallQueueStatistics.find(
      { integrationId },
      { _id: 0, __v: 0 },
    ).lean<Record<string, unknown>[]>();

    const statisticsByQueue = new Map(
      statistics.map((stat) => [String(stat.queue), stat]),
    );

    return (integration.queues || []).map(
      (queue) =>
        statisticsByQueue.get(String(queue)) || { queue, integrationId },
    );
  },

  async callQueueInitialList(
    _root,
    { queue },
    { models, user, subdomain }: IContext,
  ) {
    if (!user?._id) {
      throw new Error('Login required');
    }

    try {
      let owns = false;
      try {
        const queues = await models.CallIntegrations.getIntegrationQueuesByUser(
          user._id,
        );
        owns = queues.map(String).includes(String(queue));
      } catch (e) {
        owns = false;
      }

      if (!owns) {
        console.warn(
          `[call] callQueueInitialList: user ${user._id} is not an operator on queue ${queue}`,
        );
        if (process.env.CALL_SUBSCRIPTION_REQUIRE_AUTH === 'true') {
          return '{}';
        }
      }

      const redisKey = `callRealtimeHistory:${subdomain}:${queue}:aggregate`;
      return (await redis.get(redisKey)) || `{}`;
    } catch (error) {
      console.error(`Failed to fetch queue data for ${queue}:`, error);
      return '{}';
    }
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

  async callConversationNotes(_root, args: INotesParams, { models }: IContext) {
    const { conversationId, limit, skip, getFirst } = args;

    const conversation = await models.Conversations.findOne({
      _id: conversationId,
    });
    let messages: IMessageDocument[] = [];

    if (conversation) {
      if (limit) {
        const sort: any = getFirst ? { createdAt: 1 } : { createdAt: -1 };

        messages = await models.ConversationMessages.find({
          conversationId: conversationId,
        })
          .sort(sort)
          .skip(skip || 0)
          .limit(limit);

        return getFirst ? messages : messages.reverse();
      }

      messages = await models.ConversationMessages.find({
        conversationId: conversationId,
      })
        .sort({ createdAt: -1 })
        .limit(50);

      return messages.reverse();
    }
  },

  async callHistoryDetail(
    _root: any,
    { _id, conversationId }: { _id?: string; conversationId?: string },
    { models }: IContext,
  ): Promise<ICallHistory | null> {
    if (!_id && !conversationId) {
      throw new Error('Either _id or conversationId is required');
    }

    try {
      let result: ICallHistory | null = null;

      if (_id) {
        const cdr = await models.CallCdrs.findOne({ _id });
        if (cdr) {
          const history = mapCdrToCallHistory(cdr);
          if (cdr.uniqueid) {
            const legs = await models.CallCdrs.find({
              uniqueid: cdr.uniqueid,
            });
            if (legs.length) {
              history.callStatus = deriveCallStatusFromLegs(legs);
            }
          }
          return history;
        }

        result = await models.CallHistory.findOne({ _id });
        if (result) {
          return result;
        }
      }

      if (conversationId) {
        const histories = await models.CallCdrs.find({
          conversationId: conversationId,
        });

        const selected = selectRelevantCdr(histories);

        if (selected) {
          const history = mapCdrToCallHistory(selected);
          history.callStatus = deriveCallStatusFromLegs(histories);
          return history;
        }

        result = await models.CallHistory.findOne({ conversationId });
        if (result) {
          return result;
        }

        const session = await models.CallSessions.findOne({ conversationId });
        if (session) {
          return mapSessionToCallHistory(session);
        }
      }

      return null;
    } catch (error) {
      throw new Error('Failed to retrieve call history details');
    }
  },

  async callGetAnwseredCalls(_args, { uniqueId }, { models }: IContext) {
    return await models.CallCdrs.find({
      uniqueid: uniqueId,
    });
  },

  async callGetQueueStats(
    _args,
    { startDate, endDate, queueId, direction }: ICallReportArgs,
    { models, user }: IContext,
  ) {
    const queues = await models.CallIntegrations.getIntegrationQueuesByUser(
      user._id,
    );

    const cdrs = await models.CallCdrs.find(
      buildCdrFilter({ startDate, endDate, queueId, direction }),
    )
      .select(CDR_REPORT_FIELDS)
      .lean<ICdrLeg[]>();

    const allowedQueues = queueId ? [queueId] : queues.map(String);

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
      queueId,
      agentId = null,
      direction,
    }: ICallReportArgs & { agentId?: string | null },
    { models, user }: IContext,
  ) {
    if (!queueId) {
      return [];
    }

    const queues = await models.CallIntegrations.getIntegrationQueuesByUser(
      user._id,
    );

    if (!queues.map(String).includes(queueId)) {
      return [];
    }

    const cdrs = await models.CallCdrs.find({
      ...buildCdrFilter({ startDate, endDate, queueId, direction }),
      lastapp: 'Queue',
    })
      .select(CDR_REPORT_FIELDS)
      .lean<ICdrLeg[]>();

    return summariseAgentStats(foldLegsIntoCalls(cdrs), agentId);
  },

  async getCallbackStats(
    _args,
    { startDate, endDate, queueId }: ICallReportArgs,
    { models }: IContext,
  ) {
    const inboundCdrs = await models.CallCdrs.find(
      buildCdrFilter({
        startDate,
        endDate,
        queueId,
        direction: 'Inbound',
      }),
    )
      .select(CDR_REPORT_FIELDS)
      .lean<ICdrLeg[]>();

    // A callback can land after the reported range, so widen the outbound
    // search by the callback window itself.
    const outboundCdrs = await models.CallCdrs.find(
      buildCdrFilter({
        startDate,
        endDate: new Date(
          new Date(endDate).getTime() + CALLBACK_WINDOW_MS,
        ).toISOString(),
        queueId,
        direction: 'Outbound',
      }),
    )
      .select(CDR_REPORT_FIELDS)
      .lean<ICdrLeg[]>();

    return summariseCallbackStats(
      foldLegsIntoCalls(inboundCdrs),
      foldLegsIntoCalls(outboundCdrs),
      queueId || 'all',
    );
  },

  /**
   * KPI scorecard for the selected queue, date range, and direction.
   *
   * Five of the six figures come from the shared helpers in `statistics.ts`,
   * the same ones behind `callTodayStatistics` and the `callCalculate*`
   * queries, so every surface reports a metric the same way.
   *
   * Average Speed of Answer is the exception: it is folded per call by
   * `averageSpeedOfAnswer`, because the ring time sits on the queue leg the
   * caller waited on rather than on the leg stamped `ANSWERED`, and a
   * leg-by-leg average reads the wrong field and reports 0.
   */
  async callKpiScorecard(
    _args,
    { startDate, endDate, queueId, direction }: ICallReportArgs,
    { models }: IContext,
  ) {
    const cdrs = await models.CallCdrs.find(
      buildCdrFilter({ startDate, endDate, queueId, direction }),
    )
      .select(`${CDR_REPORT_FIELDS} answer`)
      .lean<ICdrLeg[]>();

    const [
      serviceLevel,
      abandonment,
      averageAnsweredTime,
      firstCallResolution,
      occupancy,
    ] = await Promise.all([
      calculateServiceLevel(cdrs),
      calculateAbandonmentRate(cdrs),
      calculateAverageHandlingTime(cdrs),
      calculateFirstCallResolution(cdrs),
      calculateOccupancyRate(cdrs),
    ]);

    const averageSpeed = averageSpeedOfAnswer(
      cdrs.filter(({ userfield }) => userfield === 'Inbound'),
    );

    return {
      // One call spans several CDR legs, so count distinct calls, not rows.
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
    { startDate, endDate, queueId, direction }: ICallReportArgs,
    { models }: IContext,
  ) {
    const cdrs = await models.CallCdrs.find(
      buildCdrFilter({ startDate, endDate, queueId, direction }),
    )
      .select(CDR_REPORT_FIELDS)
      .lean<ICdrLeg[]>();

    return buildVolumeSeries(foldLegsIntoCalls(cdrs));
  },

  async callCarrierBreakdown(
    _args,
    { startDate, endDate, queueId, direction }: ICallReportArgs,
    { models }: IContext,
  ) {
    const cdrs = await models.CallCdrs.find(
      buildCdrFilter({ startDate, endDate, queueId, direction }),
    )
      .select(CDR_REPORT_FIELDS)
      .lean<ICdrLeg[]>();

    return buildCarrierBreakdown(foldLegsIntoCalls(cdrs));
  },

  async callHeatmap(
    _args,
    { startDate, endDate, queueId, direction }: ICallReportArgs,
    { models }: IContext,
  ) {
    const cdrs = await models.CallCdrs.find(
      buildCdrFilter({ startDate, endDate, queueId, direction }),
    )
      .select(CDR_REPORT_FIELDS)
      .lean<ICdrLeg[]>();

    return buildHeatmap(foldLegsIntoCalls(cdrs));
  },

  async callTopNumbers(
    _args,
    {
      startDate,
      endDate,
      queueId,
      direction,
      limit = 12,
    }: ICallReportArgs & { limit?: number },
    { models }: IContext,
  ) {
    const cdrs = await models.CallCdrs.find(
      buildCdrFilter({ startDate, endDate, queueId, direction }),
    )
      .select(CDR_REPORT_FIELDS)
      .lean<ICdrLeg[]>();

    return buildTopNumbers(foldLegsIntoCalls(cdrs), limit);
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
};
markResolvers(callQueries, {
  wrapperConfig: {
    skipPermission: true,
  },
});
export default callQueries;
