import { IMessageDocument } from '@/inbox/@types/conversationMessages';
import { INotesParams } from '@/integrations/call/@types/conversationNotes';
import { ICallHistory, ICallHistoryFilterOptions } from '@/integrations/call/@types/histories';
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
  sendToGrandStream,
} from '@/integrations/call/utils';
import { markResolvers, sendTRPCMessage } from 'erxes-api-shared/utils';
import { XMLParser } from 'fast-xml-parser';
import { IContext } from '~/connectionResolvers';
import redis from '../../redlock';

const callQueries = {
  async callsIntegrationDetail(_root, { integrationId }, { models }: IContext) {
    return models.CallIntegrations.findOne({ inboxId: integrationId });
  },

  async callUserIntegrations(_root, _args, { models, user }: IContext) {
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

    if (queueData && queueData.response) {
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
    const today = new Date();
    const year = today.getFullYear();
    const month = String(today.getMonth() + 1).padStart(2, '0');
    const day = String(today.getDate()).padStart(2, '0');

    const formattedDate = `${year}-${month}-${day}`;
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
        data: {
          request: {
            action: 'queueapi',
            startTime: formattedDate,
            endTime: formattedDate,
          },
        },
        integrationId: integrationId,
        retryCount: 3,
        isConvertToJson: false,
        isAddExtention: false,
      },
      user,
    )) as any;

    if (!queueData.ok) {
      throw new Error(`HTTP error! Status: ${queueData.status}`);
    }

    const xmlData = await queueData.text();
    try {
      const parsedData = JSON.parse(xmlData);

      if (parsedData.status === -6) {
        console.log('Status -6 detected. Clearing redis callCookie.');
        await redis.del('callCookie');
        const statistics = await models.CallQueueStatistics.find({
          integrationId,
        });
        if (statistics) {
          return statistics;
        }
        return [];
      }
    } catch (error) {
      console.error(error.message);
    }

    try {
      const parser = new XMLParser();
      const jsonObject = parser.parse(xmlData);

      const rootStatistics = jsonObject.root_statistics || {};
      const queues = (rootStatistics.queue as any) || [];

      if (queues && queues.length > 0) {
        const normalizedQueues = queues?.map((q) => ({
          queueChairman: q.queuechairman,
          queue: q.queue,
          totalCalls: q.total_calls,
          answeredCalls: q.answered_calls,
          answeredRate: q.answered_rate,
          abandonedCalls: q.abandoned_calls,
          avgWait: q.avg_wait,
          avgTalk: q.avg_talk,
          vqTotalCalls: q.vq_total_calls,
          slaRate: q.sla_rate,
          vqSlaRate: q.vq_sla_rate,
          transferOutCalls: q.transfer_out_calls,
          transferOutRate: q.transfer_out_rate,
          abandonedRate: q.abandoned_rate,
          integrationId,
        }));

        if (integration.queues && normalizedQueues.length > 0) {
          const filteredQueues = normalizedQueues.filter((q) =>
            integration.queues.includes(q.queue.toString()),
          );

          for (const queue of filteredQueues) {
            await models.CallQueueStatistics.findOneAndUpdate(
              { integrationId, queue: queue.queue },
              { $set: queue },
              { upsert: true, new: true },
            );
          }

          return filteredQueues;
        }
        const stats = await models.CallQueueStatistics.find({ integrationId });
        if (stats) {
          return stats;
        }
        return [];
      }
    } catch (error) {
      const stats = await models.CallQueueStatistics.find({ integrationId });
      if (stats) {
        return stats;
      }
      return [];
    }
  },

  async callQueueInitialList(_root, { queue }) {
    try {
      const redisKey = `callRealtimeHistory:${queue}:aggregate`;
      return (await redis.get(redisKey)) || `{}`;
    } catch (error) {
      console.error(`Failed to fetch queue data for ${queue}:`, error);
      return '{}';
    }
  },

  async callQueueMemberList(
    _root,
    { integrationId, queue },
    { models, user }: IContext,
  ) {
    const queueData = (await sendToGrandStream(
      models,
      {
        path: 'api',
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        data: {
          request: {
            action: 'getCallQueuesMemberMessage',
            extension: queue,
          },
        },
        integrationId: integrationId,
        retryCount: 3,
        isConvertToJson: true,
        isAddExtention: false,
      },
      user,
    )) as any;

    if (queueData && queueData.response) {
      const { CallQueueMembersMessage } = queueData.response;

      if (CallQueueMembersMessage) {
        return CallQueueMembersMessage;
      }
      return [];
    }
    return 'request failed';
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
    }: { queue: string; startDate: string; endDate: string; direction?: string },
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
    }: { queue: string; startDate: string; endDate: string; direction?: string },
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
    }: { queue: string; startDate: string; endDate: string; direction?: string },
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
    }: { queue: string; startDate: string; endDate: string; direction?: string },
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
    }: { queue: string; startDate: string; endDate: string; direction?: string },
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
    }: { queue: string; startDate: string; endDate: string; direction?: string },
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
      }

      return null;
    } catch (error) {
      throw new Error('Failed to retrieve call history details');
    }
  },

  async callGetAnwseredCalls(_args, { uniqueId }, { models }: IContext) {
    console.log('1...', typeof uniqueId);

    const cdrs = await models.CallCdrs.find({
      uniqueid: uniqueId,
    });
    console.log('cdrs', cdrs);

    return cdrs;
  },

  async callGetQueueStats(
    _args,
    { startDate, endDate, queueId, direction },
    { models, user }: IContext,
  ) {
    const queues = await models.CallIntegrations.getIntegrationQueuesByUser(
      user._id,
    );
    // console.log(queueId, 'queueId', queues)
    // const isContainsQueue = queueId && queues.includes(queueId);
    // if (!isContainsQueue && queueId) {
    //   return [];
    // }
    const isContainsQueue = true
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

    // const start = new Date(startDate);
    // const end = new Date(endDate);

    // const inboundCount = await getInboundStats(models, startDate, endDate);
    // console.log(inboundCount, 'inbound count');

    // const queueStat = await getQueueStatsByDateRange(
    //   models,
    //   startDate,
    //   endDate,
    // );
    // console.log(queueStat, 'queue count');

    // return queueStat;

    // const as = await getDailyCallRecords(models, startDate, endDate);
    // console.log(as, 'getDailyCallRecords');

    //ENE BOLSON....
    // const ans = await getAnsweredList(models, startDate, endDate);
    // console.log(ans, 'ans count');
    // return a;

    //ENE BOLSON....
    // const mis = await getMissedList(models, startDate, endDate);
    // console.log(mis, 'mis count');

    // const incomingUnique = await models.CallCdrs.distinct('uniqueid', {
    //   start: { $gte: start },
    //   end: { $lte: end },
    //   userfield: 'Inbound',
    // });
    // const incomingCallTotalCount = incomingUnique.length;

    // const outgoingCallTotalCount = await models.CallCdrs.find({
    //   start: { $gte: new Date(startDate) },
    //   end: { $lte: new Date(endDate) },
    //   userfield: 'Outbound',
    // }).countDocuments();

    // const answeredCount = await models.CallCdrs.find({
    //   start: { $gte: new Date(startDate) },
    //   end: { $lte: new Date(endDate) },
    //   disposition: 'ANSWERED',
    //   userfield: 'Inbound',
    // }).countDocuments();

    // console.log({
    //   incomingCallTotalCount,
    //   outgoingCallTotalCount,
    //   answeredCount,
    // });
  },
  async callGetAgentStats(
    _args,
    { startDate, endDate, queueId, agentId = null, direction },
    { models, user }: IContext,
  ) {
    if (!queueId) {
      return [];
    }
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
      lastapp: 'Queue', // Зөвхөн Queue app-р дамжсан CDR-үүд
    };

    if (direction) {
      matchStage.userfield = direction;
    }

    const data = await models.CallCdrs.aggregate([
      {
        $match: matchStage,
      },

      // QUEUE ID салгаж авна
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
          // Agent нь dst талбар (1803, 1804 гэх мэт)
          agent: { $toString: '$dst' },
        },
      },

      // Queue болон Agent filter
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

      // Unique call-р бүлэглэх
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
          // Answered: ANSWERED disposition, billsec > 0
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

    // Agent нэрийг Users model-с авах (optional)
    // Хэрэв Users collection байгаа бол энийг ашиглаж болно
    /*
    const agentIds = data.map(d => d.agent);
    const users = await models.Users.find({ extension: { $in: agentIds } });
    const userMap = users.reduce((acc, user) => {
      acc[user.extension] = user.name || user.username;
      return acc;
    }, {});
  
    return data.map(d => ({
      ...d,
      agentName: userMap[d.agent] || null
    }));
    */

    return data;
  },
  async getCallbackStats(
    _args,
    { startDate, endDate, queueId },
    { models, user }: IContext,
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

      // Queue filter
      {
        $match: {
          queue: queueId ? queueId : { $ne: null },
        },
      },

      // Unique call-р бүлэглэх
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
          // Missed: ANSWERED байхгүй эсвэл ANSWERED байсан ч billsec = 0
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

      // Зөвхөн алдсан дуудлагууд
      {
        $match: { isMissed: true },
      },

      // Callback-ийг шалгах (тухайн src дугаараас эргэн холбогдсон эсэх)
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
                    // Outbound дуудлага
                    { $eq: ['$userfield', 'Outbound'] },
                    // Алдсан дуудлагын дугаар руу холбогдсон
                    { $eq: ['$dst', '$$missedSrc'] },
                    // Алдсан дуудлагын дараа холбогдсон (24 цагийн дотор)
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
                  60000, // Минут руу хөрвүүлэх
                ],
              },
              null,
            ],
          },
        },
      },

      // Queue-р бүлэглэх
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
  async callGetOperatorStats(_, { startDate, endDate }, { models }: IContext) {
    console.log('-------', typeof startDate, startDate);
    // const stats = await models.CallCdrs.aggregate([
    //   // STAGE 1: $match (Огноо, нөхцөлөөр шүүх)
    //   {
    //     $match: {
    //       // Огноог query-ээс авна
    //       start: { $gte: new Date(startDate) },
    //       end: { $lte: new Date(endDate) },

    //       // lastApp: "Queue" эсвэл "ReadExten" гэж өргөтгөж болно. Одоогоор "Queue"
    //       lastApp: { $in: ['Queue'] },

    //       // Операторын ID (dst) байгаа эсэх болон 18-аар эхэлсэн эсэхийг баталгаажуулах
    //       dst: {
    //         $exists: true,
    //         $ne: '',
    //       },
    //     },
    //   },

    //   // STAGE 2: $group by uniqueId (Дуудлагын давхцлыг арилгах)
    //   // Нэг uniqueId-тай дуудлагаас хамгийн сайн мэдээллийг авна.
    //   {
    //     $group: {
    //       _id: '$uniqueId',

    //       // Энэ дуудлагыг хүлээж авсан операторын ID-г хадгалах
    //       operatorId: { $first: '$dst' },

    //       // Disposition (Хариулт/Татгалзсан)
    //       disposition: { $first: '$disposition' },
    //     },
    //   },

    //   // STAGE 3: $group by operatorId (Эцсийн тооцоо)
    //   // Одоо оператор бүрээр давхардаагүй дуудлагуудыг тоолно.
    //   {
    //     $group: {
    //       _id: '$operatorId', // Операторын ID

    //       totalCalls: { $sum: 1 }, // Unique дуудлагын нийт тоо

    //       // ANSWERED бол 1-ээр нэмэгдэнэ
    //       answeredCount: {
    //         $sum: { $cond: [{ $eq: ['$disposition', 'ANSWERED'] }, 1, 0] },
    //       },

    //       // ANSWERED биш бол 1-ээр нэмэгдэнэ (Missed/No Answer)
    //       missedCount: {
    //         $sum: { $cond: [{ $ne: ['$disposition', 'ANSWERED'] }, 1, 0] },
    //       },
    //     },
    //   },

    //   // STAGE 4: $addFields (Нэмэлт талбар: Хариултын хувь - Answer Rate)
    //   {
    //     $addFields: {
    //       answerRate: {
    //         $round: [
    //           {
    //             $multiply: [
    //               { $divide: ['$answeredCount', '$totalCalls'] },
    //               100,
    //             ],
    //           },
    //           2, // 2 оронгоор тоймлох
    //         ],
    //       },
    //     },
    //   },

    //   // STAGE 5: $sort (Хамгийн их дуудлагатай оператороос эхлэн эрэмбэлэх)
    //   { $sort: { totalCalls: -1 } },
    // ]);
    return await models.CallCdrs.aggregate([
      {
        $match: {
          start: { $gte: new Date(startDate), $lte: new Date(endDate) },
        },
      },
      {
        $group: {
          _id: {
            // Агентыг тодорхойлох логик:
            // Outbound бол src нь агент. Inbound бол dst нь агент.
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
      // Зөвхөн 4 оронтой тоо (Агент)-уудыг шүүж авах (Жишээ нь 1801, 1002 гэх мэт)
      {
        $addFields: {
          // Agent ID-г string болгож, цэвэрлэх
          cleanAgentId: {
            $trim: { input: { $toString: '$_id.agent' } },
          },
        },
      },
      {
        $match: {
          // Цэвэрлэсэн ID нь 3 эсвэл 4 оронтой тоо байх
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
