import { IMessageDocument } from '@/inbox/@types/conversationMessages';
import { INotesParams } from '@/integrations/call/@types/conversationNotes';
import {
  ICallHistory,
  ICallHistoryFilterOptions,
} from '@/integrations/call/@types/histories';
import { selectRelevantCdr } from '@/integrations/call/services/cdrUtils';
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
    await models.CallIntegrations.getIntegration(user._id, integrationId);

    return models.CallQueueStatistics.find(
      { integrationId },
      { _id: 0, __v: 0 },
    ).lean<any[]>();
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
      const now = new Date();
      const dateFrom = new Date(
        now.getFullYear(),
        now.getMonth(),
        now.getDate(),
      );
      const dateTo = new Date(
        now.getFullYear(),
        now.getMonth(),
        now.getDate() + 1,
      );

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
          return mapCdrToCallHistory(cdr);
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
          return mapCdrToCallHistory(selected);
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
    { startDate, endDate, queueId, direction },
    { models, user }: IContext,
  ) {
    // const isAdmin =
    //   user.isOwner || user.permissionGroupIds?.includes('frontline:admin');
    const queues = await models.CallIntegrations.getIntegrationQueuesByUser(
      user._id,
    );

    const isContainsQueue = true;
    const matchStage: any = {
      start: { $gte: new Date(startDate) },
      end: { $lte: new Date(endDate) },
    };

    if (direction) {
      matchStage.userfield = direction;
    }

    return await models.CallCdrs.aggregate([
      {
        $match: matchStage,
      },

      {
        $addFields: {
          queue: {
            $cond: [
              {
                $regexMatch: {
                  input: { $ifNull: ['$actionType', ''] },
                  regex: /QUEUE\[/,
                },
              },
              {
                $arrayElemAt: [
                  {
                    $split: [
                      {
                        $arrayElemAt: [
                          { $split: ['$actionType', 'QUEUE['] },
                          1,
                        ],
                      },
                      ']',
                    ],
                  },
                  0,
                ],
              },
              null,
            ],
          },
        },
      },

      {
        $match: {
          queue: isContainsQueue ? queueId : { $in: queues },
        },
      },

      {
        $group: {
          _id: { queue: '$queue', uniqueid: '$uniqueid' },
          dispositions: { $addToSet: '$disposition' },
          billsec: { $max: '$billsec' },
          duration: { $max: '$duration' },
          waitTime: { $max: '$waittime' },
          lastapp: { $last: '$lastapp' },
          dst: { $last: '$dst' },
        },
      },

      {
        $project: {
          queue: '$_id.queue',
          isAnswered: {
            $and: [
              { $in: ['ANSWERED', '$dispositions'] },
              { $gt: ['$billsec', 0] },
              {
                $or: [
                  { $eq: ['$lastapp', 'Queue'] },
                  { $eq: ['$lastapp', 'Playback'] },
                ],
              },
            ],
          },
          isAbandoned: {
            $or: [
              { $not: [{ $in: ['ANSWERED', '$dispositions'] }] },
              {
                $and: [
                  { $in: ['ANSWERED', '$dispositions'] },
                  { $eq: ['$billsec', 0] },
                ],
              },
            ],
          },

          billsec: 1,
          waitTime: { $ifNull: ['$waitTime', 0] },
        },
      },

      {
        $group: {
          _id: '$queue',
          totalCalls: { $sum: 1 },
          answeredCalls: { $sum: { $cond: ['$isAnswered', 1, 0] } },
          abandonedCalls: { $sum: { $cond: ['$isAbandoned', 1, 0] } },
          totalWaitTime: {
            $sum: {
              $cond: ['$isAnswered', '$waitTime', 0],
            },
          },
          totalTalkTime: {
            $sum: {
              $cond: ['$isAnswered', '$billsec', 0],
            },
          },
        },
      },

      {
        $project: {
          queue: '$_id',
          totalCalls: 1,
          answeredCalls: 1,
          answeredRate: {
            $cond: [
              { $gt: ['$totalCalls', 0] },
              {
                $round: [
                  {
                    $multiply: [
                      { $divide: ['$answeredCalls', '$totalCalls'] },
                      100,
                    ],
                  },
                  2,
                ],
              },
              0,
            ],
          },
          abandonedCalls: 1,
          abandonedRate: {
            $cond: [
              { $gt: ['$totalCalls', 0] },
              {
                $round: [
                  {
                    $multiply: [
                      { $divide: ['$abandonedCalls', '$totalCalls'] },
                      100,
                    ],
                  },
                  2,
                ],
              },
              0,
            ],
          },

          averageWaitTime: {
            $cond: [
              { $gt: ['$answeredCalls', 0] },
              {
                $round: [{ $divide: ['$totalWaitTime', '$answeredCalls'] }, 2],
              },
              0,
            ],
          },
          averageTalkTime: {
            $cond: [
              { $gt: ['$answeredCalls', 0] },
              {
                $round: [{ $divide: ['$totalTalkTime', '$answeredCalls'] }, 2],
              },
              0,
            ],
          },
        },
      },

      { $sort: { queue: 1 } },
    ]);
  },
  async callGetAgentStats(
    _args,
    { startDate, endDate, queueId, agentId = null, direction },
    { models, user }: IContext,
  ) {
    if (!queueId) {
      return [];
    }
    // const isAdmin =
    //   user.isOwner || user.permissionGroupIds?.includes('frontline:admin');
    const queues = await models.CallIntegrations.getIntegrationQueuesByUser(
      user._id,
    );

    const isContainsQueue = queueId && queues.includes(queueId);
    if (!isContainsQueue && queueId) {
      return [];
    }

    const matchStage: any = {
      start: { $gte: new Date(startDate) },
      end: { $lte: new Date(endDate) },
      lastapp: 'Queue',
    };

    if (direction) {
      matchStage.userfield = direction;
    }

    const data = await models.CallCdrs.aggregate([
      {
        $match: matchStage,
      },

      {
        $addFields: {
          queue: {
            $cond: [
              {
                $regexMatch: {
                  input: { $ifNull: ['$actionType', ''] },
                  regex: /QUEUE\[/,
                },
              },
              {
                $arrayElemAt: [
                  {
                    $split: [
                      {
                        $arrayElemAt: [
                          { $split: ['$actionType', 'QUEUE['] },
                          1,
                        ],
                      },
                      ']',
                    ],
                  },
                  0,
                ],
              },
              null,
            ],
          },
          agent: { $toString: '$dst' },
        },
      },

      {
        $match: {
          queue: queueId ? queueId : { $ne: null },
          agent: agentId ? agentId : { $nin: [null, ''] },
          $expr: {
            $and: [
              { $gte: [{ $strLenCP: '$agent' }, 4] },
              { $lte: [{ $strLenCP: '$agent' }, 4] },
              { $regexMatch: { input: '$agent', regex: /^[0-9]{4}$/ } },
            ],
          },
        },
      },

      {
        $group: {
          _id: { queue: '$queue', agent: '$agent', uniqueid: '$uniqueid' },
          dispositions: { $addToSet: '$disposition' },
          billsec: { $max: '$billsec' },
          waitTime: { $max: '$waittime' },
          lastapp: { $last: '$lastapp' },
        },
      },

      {
        $project: {
          queue: '$_id.queue',
          agent: '$_id.agent',
          isAnswered: {
            $and: [
              { $in: ['ANSWERED', '$dispositions'] },
              { $gt: ['$billsec', 0] },
            ],
          },
          isMissed: {
            $or: [
              { $not: [{ $in: ['ANSWERED', '$dispositions'] }] },
              {
                $and: [
                  { $in: ['ANSWERED', '$dispositions'] },
                  { $eq: ['$billsec', 0] },
                ],
              },
            ],
          },
          billsec: 1,
          waitTime: { $ifNull: ['$waitTime', 0] },
        },
      },

      {
        $group: {
          _id: '$agent',
          totalCalls: { $sum: 1 },
          answeredCalls: { $sum: { $cond: ['$isAnswered', 1, 0] } },
          missedCalls: { $sum: { $cond: ['$isMissed', 1, 0] } },
          totalTalkTime: {
            $sum: {
              $cond: ['$isAnswered', '$billsec', 0],
            },
          },
          totalWaitTime: {
            $sum: {
              $cond: ['$isAnswered', '$waitTime', 0],
            },
          },
          shortestCall: {
            $min: {
              $cond: [
                { $and: ['$isAnswered', { $gt: ['$billsec', 0] }] },
                '$billsec',
                null,
              ],
            },
          },
          longestCall: {
            $max: {
              $cond: ['$isAnswered', '$billsec', null],
            },
          },
        },
      },

      {
        $project: {
          agent: '$_id',
          totalCalls: 1,
          answeredCalls: 1,
          answeredRate: {
            $cond: [
              { $gt: ['$totalCalls', 0] },
              {
                $round: [
                  {
                    $multiply: [
                      { $divide: ['$answeredCalls', '$totalCalls'] },
                      100,
                    ],
                  },
                  2,
                ],
              },
              0,
            ],
          },
          missedCalls: 1,
          missedRate: {
            $cond: [
              { $gt: ['$totalCalls', 0] },
              {
                $round: [
                  {
                    $multiply: [
                      { $divide: ['$missedCalls', '$totalCalls'] },
                      100,
                    ],
                  },
                  2,
                ],
              },
              0,
            ],
          },
          totalTalkTime: 1,
          averageTalkTime: {
            $cond: [
              { $gt: ['$answeredCalls', 0] },
              {
                $round: [{ $divide: ['$totalTalkTime', '$answeredCalls'] }, 2],
              },
              0,
            ],
          },
          totalWaitTime: 1,
          averageWaitTime: {
            $cond: [
              { $gt: ['$answeredCalls', 0] },
              {
                $round: [{ $divide: ['$totalWaitTime', '$answeredCalls'] }, 2],
              },
              0,
            ],
          },
          shortestCall: { $ifNull: ['$shortestCall', 0] },
          longestCall: { $ifNull: ['$longestCall', 0] },
        },
      },

      { $sort: { agent: 1 } },
    ]);

    return data;
  },
  async getCallbackStats(
    _args,
    { startDate, endDate, queueId },
    { models }: IContext,
  ) {
    const data = await models.CallCdrs.aggregate([
      {
        $match: {
          userfield: 'Inbound',
          start: { $gte: new Date(startDate) },
          end: { $lte: new Date(endDate) },
        },
      },

      {
        $addFields: {
          queue: {
            $cond: [
              {
                $regexMatch: {
                  input: { $ifNull: ['$actionType', ''] },
                  regex: /QUEUE\[/,
                },
              },
              {
                $arrayElemAt: [
                  {
                    $split: [
                      {
                        $arrayElemAt: [
                          { $split: ['$actionType', 'QUEUE['] },
                          1,
                        ],
                      },
                      ']',
                    ],
                  },
                  0,
                ],
              },
              null,
            ],
          },
        },
      },

      {
        $match: {
          queue: queueId ? queueId : { $ne: null },
        },
      },

      {
        $group: {
          _id: { queue: '$queue', uniqueid: '$uniqueid' },
          src: { $first: '$src' },
          dispositions: { $addToSet: '$disposition' },
          billsec: { $max: '$billsec' },
          start: { $first: '$start' },
          end: { $max: '$end' },
        },
      },

      {
        $project: {
          queue: '$_id.queue',
          uniqueid: '$_id.uniqueid',
          src: 1,
          start: 1,
          end: 1,
          isMissed: {
            $or: [
              { $not: [{ $in: ['ANSWERED', '$dispositions'] }] },
              {
                $and: [
                  { $in: ['ANSWERED', '$dispositions'] },
                  { $eq: ['$billsec', 0] },
                ],
              },
            ],
          },
        },
      },

      {
        $match: { isMissed: true },
      },

      {
        $lookup: {
          from: 'callcdrs',
          let: {
            missedSrc: '$src',
            missedTime: '$end',
            missedQueue: '$queue',
          },
          pipeline: [
            {
              $match: {
                $expr: {
                  $and: [
                    { $eq: ['$userfield', 'Outbound'] },
                    { $eq: ['$dst', '$$missedSrc'] },
                    { $gte: ['$start', '$$missedTime'] },
                    {
                      $lte: [
                        '$start',
                        { $add: ['$$missedTime', 24 * 60 * 60 * 1000] },
                      ],
                    },
                  ],
                },
              },
            },
            {
              $project: {
                disposition: 1,
                billsec: 1,
                start: 1,
              },
            },
          ],
          as: 'callbacks',
        },
      },

      {
        $addFields: {
          callbackAttempted: { $gt: [{ $size: '$callbacks' }, 0] },
          successfulCallback: {
            $anyElementTrue: {
              $map: {
                input: '$callbacks',
                as: 'cb',
                in: {
                  $and: [
                    { $eq: ['$$cb.disposition', 'ANSWERED'] },
                    { $gt: ['$$cb.billsec', 0] },
                  ],
                },
              },
            },
          },
          callbackTime: {
            $cond: [
              { $gt: [{ $size: '$callbacks' }, 0] },
              {
                $divide: [
                  {
                    $subtract: [{ $min: '$callbacks.start' }, '$end'],
                  },
                  60000,
                ],
              },
              null,
            ],
          },
        },
      },

      {
        $group: {
          _id: '$queue',
          totalMissedCalls: { $sum: 1 },
          callbackAttempts: {
            $sum: { $cond: ['$callbackAttempted', 1, 0] },
          },
          successfulCallbacks: {
            $sum: { $cond: ['$successfulCallback', 1, 0] },
          },
          pendingCallbacks: {
            $sum: {
              $cond: [{ $not: ['$callbackAttempted'] }, 1, 0],
            },
          },
          totalCallbackTime: {
            $sum: { $ifNull: ['$callbackTime', 0] },
          },
          callbackCount: {
            $sum: {
              $cond: [{ $ne: ['$callbackTime', null] }, 1, 0],
            },
          },
        },
      },

      {
        $project: {
          queue: '$_id',
          totalMissedCalls: 1,
          callbackAttempts: 1,
          successfulCallbacks: 1,
          callbackRate: {
            $cond: [
              { $gt: ['$totalMissedCalls', 0] },
              {
                $round: [
                  {
                    $multiply: [
                      {
                        $divide: ['$successfulCallbacks', '$totalMissedCalls'],
                      },
                      100,
                    ],
                  },
                  2,
                ],
              },
              0,
            ],
          },
          pendingCallbacks: 1,
          averageCallbackTime: {
            $cond: [
              { $gt: ['$callbackCount', 0] },
              {
                $round: [
                  { $divide: ['$totalCallbackTime', '$callbackCount'] },
                  2,
                ],
              },
              0,
            ],
          },
        },
      },

      { $sort: { queue: 1 } },
    ]);

    return data;
  },
  // ─── Carrier stage helper ──────────────────────────────────────────────────
  // Derives Mongolian carrier from the first two digits of a phone number.
  // carreStage is inlined in each pipeline that needs it.

  async callKpiScorecard(
    _args,
    {
      startDate,
      endDate,
      queueId,
      direction,
    }: {
      startDate: string;
      endDate: string;
      queueId?: string;
      direction?: string;
    },
    { models }: IContext,
  ) {
    const T_SL = 20; // Service Level threshold in seconds

    const baseMatch: any = {
      start: { $gte: new Date(startDate), $lte: new Date(endDate) },
    };
    if (direction && direction !== 'all') {
      baseMatch.userfield = direction;
    }

    const queueAddField = {
      $addFields: {
        _queue: {
          $cond: [
            {
              $regexMatch: {
                input: { $ifNull: ['$actionType', ''] },
                regex: /QUEUE\[/,
              },
            },
            {
              $arrayElemAt: [
                {
                  $split: [
                    {
                      $arrayElemAt: [{ $split: ['$actionType', 'QUEUE['] }, 1],
                    },
                    ']',
                  ],
                },
                0,
              ],
            },
            null,
          ],
        },
      },
    };

    const queueMatchStage: any =
      queueId && queueId !== 'all'
        ? { $match: { _queue: queueId } }
        : { $match: {} };

    const dedupeByUniqueid = {
      $group: {
        _id: '$uniqueid',
        userfield: { $first: '$userfield' },
        dispositions: { $addToSet: '$disposition' },
        billsec: { $max: '$billsec' },
        waittime: { $max: { $ifNull: ['$waittime', 0] } },
        actionType: { $first: '$actionType' },
        src: { $first: '$src' },
        start: { $first: '$start' },
      },
    };

    const addIsAnswered = {
      $addFields: {
        isAnswered: {
          $and: [
            { $in: ['ANSWERED', '$dispositions'] },
            { $gt: ['$billsec', 0] },
          ],
        },
        isInbound: { $eq: ['$userfield', 'Inbound'] },
        isAbandoned: {
          $and: [
            { $eq: ['$userfield', 'Inbound'] },
            {
              $or: [
                { $not: [{ $in: ['ANSWERED', '$dispositions'] }] },
                {
                  $and: [
                    { $in: ['ANSWERED', '$dispositions'] },
                    { $eq: ['$billsec', 0] },
                  ],
                },
              ],
            },
          ],
        },
      },
    };

    const [result] = await models.CallCdrs.aggregate([
      { $match: baseMatch },
      queueAddField,
      queueMatchStage,
      dedupeByUniqueid,
      addIsAnswered,
      {
        $facet: {
          inbound: [
            { $match: { isInbound: true } },
            {
              $group: {
                _id: null,
                offered: { $sum: 1 },
                answered: { $sum: { $cond: ['$isAnswered', 1, 0] } },
                abandoned: { $sum: { $cond: ['$isAbandoned', 1, 0] } },
                withinSL: {
                  $sum: {
                    $cond: [
                      { $and: ['$isAnswered', { $lte: ['$waittime', T_SL] }] },
                      1,
                      0,
                    ],
                  },
                },
                sumWait: { $sum: { $cond: ['$isAnswered', '$waittime', 0] } },
              },
            },
          ],
          handled: [
            { $match: { isAnswered: true } },
            {
              $group: {
                _id: null,
                answered: { $sum: 1 },
                sumTalk: { $sum: '$billsec' },
              },
            },
          ],
          totals: [{ $count: 'n' }],
        },
      },
      {
        $project: {
          inbound: { $first: '$inbound' },
          handled: { $first: '$handled' },
          callstotal: { $ifNull: [{ $first: '$totals.n' }, 0] },
        },
      },
      {
        $project: {
          callstotal: 1,
          serviceLevel: {
            $let: {
              vars: {
                d: {
                  $add: [
                    { $ifNull: ['$inbound.answered', 0] },
                    { $ifNull: ['$inbound.abandoned', 0] },
                  ],
                },
              },
              in: {
                $cond: [
                  { $gt: ['$$d', 0] },
                  {
                    $multiply: [
                      {
                        $divide: [{ $ifNull: ['$inbound.withinSL', 0] }, '$$d'],
                      },
                      100,
                    ],
                  },
                  0,
                ],
              },
            },
          },
          abandonment: {
            $cond: [
              { $gt: [{ $ifNull: ['$inbound.offered', 0] }, 0] },
              {
                $multiply: [
                  {
                    $divide: [
                      { $ifNull: ['$inbound.abandoned', 0] },
                      '$inbound.offered',
                    ],
                  },
                  100,
                ],
              },
              0,
            ],
          },
          averageSpeed: {
            $cond: [
              { $gt: [{ $ifNull: ['$inbound.answered', 0] }, 0] },
              {
                $divide: [
                  { $ifNull: ['$inbound.sumWait', 0] },
                  '$inbound.answered',
                ],
              },
              0,
            ],
          },
          averageAnsweredTime: {
            $cond: [
              { $gt: [{ $ifNull: ['$handled.answered', 0] }, 0] },
              {
                $add: [
                  {
                    $divide: [
                      { $ifNull: ['$handled.sumTalk', 0] },
                      '$handled.answered',
                    ],
                  },
                  38,
                ],
              },
              0,
            ],
          },
          firstCallResolution: { $literal: null },
          occupancy: { $literal: null },
        },
      },
    ]);

    return (
      result ?? {
        callstotal: 0,
        serviceLevel: 0,
        abandonment: 0,
        averageSpeed: 0,
        averageAnsweredTime: 0,
        firstCallResolution: 0,
        occupancy: 0,
      }
    );
  },

  async callVolumeSeries(
    _args,
    {
      startDate,
      endDate,
      queueId,
      direction,
    }: {
      startDate: string;
      endDate: string;
      queueId?: string;
      direction?: string;
    },
    { models }: IContext,
  ) {
    const matchStage: any = {
      start: { $gte: new Date(startDate), $lte: new Date(endDate) },
    };
    if (direction && direction !== 'all') {
      matchStage.userfield = direction;
    }

    const queueAddField = {
      $addFields: {
        _queue: {
          $cond: [
            {
              $regexMatch: {
                input: { $ifNull: ['$actionType', ''] },
                regex: /QUEUE\[/,
              },
            },
            {
              $arrayElemAt: [
                {
                  $split: [
                    {
                      $arrayElemAt: [{ $split: ['$actionType', 'QUEUE['] }, 1],
                    },
                    ']',
                  ],
                },
                0,
              ],
            },
            null,
          ],
        },
      },
    };

    const pipeline: any[] = [{ $match: matchStage }, queueAddField];

    if (queueId && queueId !== 'all') {
      pipeline.push({ $match: { _queue: queueId } });
    }

    pipeline.push(
      // Dedupe CDR legs per call
      {
        $group: {
          _id: '$uniqueid',
          userfield: { $first: '$userfield' },
          dispositions: { $addToSet: '$disposition' },
          billsec: { $max: '$billsec' },
          start: { $first: '$start' },
        },
      },
      {
        $addFields: {
          day: {
            $dateFromString: {
              dateString: {
                $dateToString: {
                  date: '$start',
                  format: '%Y-%m-%d',
                  timezone: 'Asia/Ulaanbaatar',
                },
              },
              format: '%Y-%m-%d',
              timezone: 'Asia/Ulaanbaatar',
            },
          },
          isAnswered: {
            $and: [
              { $in: ['ANSWERED', '$dispositions'] },
              { $gt: ['$billsec', 0] },
            ],
          },
        },
      },
      {
        $group: {
          _id: '$day',
          incoming: {
            $sum: { $cond: [{ $eq: ['$userfield', 'Inbound'] }, 1, 0] },
          },
          outgoing: {
            $sum: { $cond: [{ $eq: ['$userfield', 'Outbound'] }, 1, 0] },
          },
          answered: { $sum: { $cond: ['$isAnswered', 1, 0] } },
          abandoned: {
            $sum: {
              $cond: [
                {
                  $and: [
                    { $eq: ['$userfield', 'Inbound'] },
                    { $not: ['$isAnswered'] },
                  ],
                },
                1,
                0,
              ],
            },
          },
        },
      },
      {
        $project: {
          _id: 0,
          day: '$_id',
          incoming: 1,
          outgoing: 1,
          answered: 1,
          abandoned: 1,
        },
      },
      { $sort: { day: 1 } },
    );

    return models.CallCdrs.aggregate(pipeline);
  },

  async callCarrierBreakdown(
    _args,
    {
      startDate,
      endDate,
      queueId,
      direction,
    }: {
      startDate: string;
      endDate: string;
      queueId?: string;
      direction?: string;
    },
    { models }: IContext,
  ) {
    const matchStage: any = {
      start: { $gte: new Date(startDate), $lte: new Date(endDate) },
    };
    if (direction && direction !== 'all') {
      matchStage.userfield = direction;
    }

    const pipeline: any[] = [{ $match: matchStage }];

    if (queueId && queueId !== 'all') {
      pipeline.push(
        {
          $addFields: {
            _queue: {
              $cond: [
                {
                  $regexMatch: {
                    input: { $ifNull: ['$actionType', ''] },
                    regex: /QUEUE\[/,
                  },
                },
                {
                  $arrayElemAt: [
                    {
                      $split: [
                        {
                          $arrayElemAt: [
                            { $split: ['$actionType', 'QUEUE['] },
                            1,
                          ],
                        },
                        ']',
                      ],
                    },
                    0,
                  ],
                },
                null,
              ],
            },
          },
        },
        { $match: { _queue: queueId } },
      );
    }

    // Use src for inbound, dst for outbound to get the customer phone
    const customerPhone = {
      $cond: [{ $eq: ['$userfield', 'Inbound'] }, '$src', '$dst'],
    };

    pipeline.push(
      {
        $addFields: {
          _customerPhone: customerPhone,
        },
      },
      {
        $addFields: {
          carrier: {
            $let: {
              vars: {
                p2: {
                  $substrBytes: [{ $ifNull: ['$_customerPhone', ''] }, 0, 2],
                },
              },
              in: {
                $switch: {
                  branches: [
                    {
                      case: { $in: ['$$p2', ['99', '95', '85']] },
                      then: 'Mobicom',
                    },
                    { case: { $in: ['$$p2', ['89', '96']] }, then: 'Unitel' },
                    {
                      case: { $in: ['$$p2', ['91', '94', '90']] },
                      then: 'Skytel',
                    },
                    { case: { $in: ['$$p2', ['98', '93']] }, then: 'G-Mobile' },
                    { case: { $eq: ['$$p2', '97'] }, then: 'Ondo' },
                  ],
                  default: 'Other',
                },
              },
            },
          },
        },
      },
      { $group: { _id: '$carrier', value: { $sum: 1 } } },
      { $project: { _id: 0, name: '$_id', value: 1 } },
      { $sort: { value: -1 } },
    );

    return models.CallCdrs.aggregate(pipeline);
  },

  async callHeatmap(
    _args,
    {
      startDate,
      endDate,
      queueId,
      direction,
    }: {
      startDate: string;
      endDate: string;
      queueId?: string;
      direction?: string;
    },
    { models }: IContext,
  ) {
    const matchStage: any = {
      start: { $gte: new Date(startDate), $lte: new Date(endDate) },
    };
    if (direction && direction !== 'all') {
      matchStage.userfield = direction;
    }

    const pipeline: any[] = [{ $match: matchStage }];

    if (queueId && queueId !== 'all') {
      pipeline.push(
        {
          $addFields: {
            _queue: {
              $cond: [
                {
                  $regexMatch: {
                    input: { $ifNull: ['$actionType', ''] },
                    regex: /QUEUE\[/,
                  },
                },
                {
                  $arrayElemAt: [
                    {
                      $split: [
                        {
                          $arrayElemAt: [
                            { $split: ['$actionType', 'QUEUE['] },
                            1,
                          ],
                        },
                        ']',
                      ],
                    },
                    0,
                  ],
                },
                null,
              ],
            },
          },
        },
        { $match: { _queue: queueId } },
      );
    }

    pipeline.push(
      {
        $group: {
          _id: '$uniqueid',
          dispositions: { $addToSet: '$disposition' },
          billsec: { $max: '$billsec' },
          start: { $first: '$start' },
        },
      },
      {
        $addFields: {
          isAnswered: {
            $and: [
              { $in: ['ANSWERED', '$dispositions'] },
              { $gt: ['$billsec', 0] },
            ],
          },
          dow: {
            $isoDayOfWeek: { date: '$start', timezone: 'Asia/Ulaanbaatar' },
          },
          hour: { $hour: { date: '$start', timezone: 'Asia/Ulaanbaatar' } },
        },
      },
      {
        $group: {
          _id: { dow: '$dow', hour: '$hour' },
          total: { $sum: 1 },
          answered: { $sum: { $cond: ['$isAnswered', 1, 0] } },
        },
      },
      {
        $project: {
          _id: 0,
          dow: '$_id.dow',
          hour: '$_id.hour',
          total: 1,
          answered: 1,
          answerRate: {
            $cond: [
              { $gt: ['$total', 0] },
              { $multiply: [{ $divide: ['$answered', '$total'] }, 100] },
              0,
            ],
          },
        },
      },
    );

    return models.CallCdrs.aggregate(pipeline);
  },

  async callTopNumbers(
    _args,
    {
      startDate,
      endDate,
      queueId,
      direction,
      limit = 12,
    }: {
      startDate: string;
      endDate: string;
      queueId?: string;
      direction?: string;
      limit?: number;
    },
    { models }: IContext,
  ) {
    const matchStage: any = {
      start: { $gte: new Date(startDate), $lte: new Date(endDate) },
    };
    if (direction && direction !== 'all') {
      matchStage.userfield = direction;
    }

    const pipeline: any[] = [{ $match: matchStage }];

    if (queueId && queueId !== 'all') {
      pipeline.push(
        {
          $addFields: {
            _queue: {
              $cond: [
                {
                  $regexMatch: {
                    input: { $ifNull: ['$actionType', ''] },
                    regex: /QUEUE\[/,
                  },
                },
                {
                  $arrayElemAt: [
                    {
                      $split: [
                        {
                          $arrayElemAt: [
                            { $split: ['$actionType', 'QUEUE['] },
                            1,
                          ],
                        },
                        ']',
                      ],
                    },
                    0,
                  ],
                },
                null,
              ],
            },
          },
        },
        { $match: { _queue: queueId } },
      );
    }

    pipeline.push(
      {
        $addFields: {
          _customerPhone: {
            $cond: [{ $eq: ['$userfield', 'Inbound'] }, '$src', '$dst'],
          },
        },
      },
      {
        $group: {
          _id: '$uniqueid',
          customerPhone: { $first: '$_customerPhone' },
          dispositions: { $addToSet: '$disposition' },
          billsec: { $max: '$billsec' },
        },
      },
      {
        $addFields: {
          isAnswered: {
            $and: [
              { $in: ['ANSWERED', '$dispositions'] },
              { $gt: ['$billsec', 0] },
            ],
          },
        },
      },
      {
        $addFields: {
          carrier: {
            $let: {
              vars: {
                p2: {
                  $substrBytes: [{ $ifNull: ['$customerPhone', ''] }, 0, 2],
                },
              },
              in: {
                $switch: {
                  branches: [
                    {
                      case: { $in: ['$$p2', ['99', '95', '85']] },
                      then: 'Mobicom',
                    },
                    { case: { $in: ['$$p2', ['89', '96']] }, then: 'Unitel' },
                    {
                      case: { $in: ['$$p2', ['91', '94', '90']] },
                      then: 'Skytel',
                    },
                    { case: { $in: ['$$p2', ['98', '93']] }, then: 'G-Mobile' },
                    { case: { $eq: ['$$p2', '97'] }, then: 'Ondo' },
                  ],
                  default: 'Other',
                },
              },
            },
          },
        },
      },
      {
        $group: {
          _id: '$customerPhone',
          carrier: { $first: '$carrier' },
          attempts: { $sum: 1 },
          answered: { $sum: { $cond: ['$isAnswered', 1, 0] } },
          duration: { $sum: { $cond: ['$isAnswered', '$billsec', 0] } },
        },
      },
      {
        $addFields: { missed: { $subtract: ['$attempts', '$answered'] } },
      },
      { $sort: { attempts: -1 } },
      { $limit: limit },
      {
        $project: {
          _id: 0,
          number: '$_id',
          carrier: 1,
          attempts: 1,
          answered: 1,
          missed: 1,
          duration: 1,
        },
      },
    );

    return models.CallCdrs.aggregate(pipeline);
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
