import { IContext } from '~/connectionResolvers';
import redis from '../../redlock';
import { XMLParser } from 'fast-xml-parser';
import { ICallHistoryFilterOptions } from '@/integrations/call/@types/histories';
import { markResolvers, sendTRPCMessage } from 'erxes-api-shared/utils';
import {
  getQueueStatsByDateRange,
  mapCdrToCallHistory,
  sendToGrandStream,
} from '@/integrations/call/utils';
import {
  calculateAbandonmentRate,
  calculateAverageHandlingTime,
  calculateAverageSpeedOfAnswer,
  calculateFirstCallResolution,
  calculateServiceLevel,
} from '@/integrations/call/statistics';
import { INotesParams } from '@/integrations/call/@types/conversationNotes';
import { IMessageDocument } from '@/inbox/@types/conversationMessages';
import { ICallHistory } from '@/integrations/call/@types/histories';
import { selectRelevantCdr } from '@/integrations/call/services/cdrUtils';

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
    const DEFAULT_VALUE = '0';

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
        serviceLevel: serviceLevel?.toString() || DEFAULT_VALUE,
        firstCallResolution: firstCallResolution?.toString() || DEFAULT_VALUE,
        averageSpeed: averageSpeed?.toString() || DEFAULT_VALUE,
        averageAnsweredTime: averageAnsweredTime?.toString() || DEFAULT_VALUE,
      };
    } catch (error) {
      console.error('Error in callTodayStatistics:', error);

      return {
        serviceLevel: DEFAULT_VALUE,
        firstCallResolution: DEFAULT_VALUE,
        averageSpeed: DEFAULT_VALUE,
        averageAnsweredTime: DEFAULT_VALUE,
      };
    }
  },

  async callCalculateServiceLevel(_root, { queue }, { models }: IContext) {
    const now = new Date();
    const dateFrom = new Date(now.getFullYear(), 10, 18);
    const dateTo = new Date(now.getFullYear(), 10, 19);

    const todyCdrs = await models.CallCdrs.find({
      actionType: { $regex: queue },
      start: {
        $gte: dateFrom,
        $lt: dateTo,
      },
    });

    const serviceLevel = await calculateServiceLevel(todyCdrs);
    console.log(serviceLevel, 'serviceLevel');
    return 'serviceLevel';
  },
  async callCalculateFirstCallResolution(
    _root,
    { queue },
    { models }: IContext,
  ) {
    const now = new Date();
    const dateFrom = new Date(now.getFullYear(), 5, 12);
    const dateTo = new Date(now.getFullYear(), 5, 13);

    const todyCdrs = await models.CallCdrs.find({
      actionType: { $regex: queue },
      start: {
        $gte: dateFrom,
        $lt: dateTo,
      },
    });

    const firstCallResolution = await calculateFirstCallResolution(todyCdrs);

    return firstCallResolution;
  },
  async callCalculateAbandonmentRate(_root, { queue }, { models }: IContext) {
    const now = new Date();
    const dateFrom = new Date(now.getFullYear(), 5, 12);
    const dateTo = new Date(now.getFullYear(), 5, 13);

    const todyCdrs = await models.CallCdrs.find({
      actionType: { $regex: queue },
      start: {
        $gte: dateFrom,
        $lt: dateTo,
      },
    });

    const abandonedRate = await calculateAbandonmentRate(todyCdrs);

    return abandonedRate;
  },

  async callCalculateAverageSpeedOfAnswer(
    _root,
    { queue },
    { models }: IContext,
  ) {
    const now = new Date();
    const dateFrom = new Date(now.getFullYear(), 5, 12);
    const dateTo = new Date(now.getFullYear(), 5, 13);

    const todyCdrs = await models.CallCdrs.find({
      actionType: { $regex: queue },
      start: {
        $gte: dateFrom,
        $lt: dateTo,
      },
    });

    const averageSpeed = await calculateAverageSpeedOfAnswer(todyCdrs);

    return averageSpeed;
  },

  async callCalculateAverageHandlingTime(
    _root,
    { queue },
    { models }: IContext,
  ) {
    const now = new Date();
    const dateFrom = new Date(now.getFullYear(), 5, 12);
    const dateTo = new Date(now.getFullYear(), 5, 13);

    const todyCdrs = await models.CallCdrs.find({
      actionType: { $regex: queue },
      start: {
        $gte: dateFrom,
        $lt: dateTo,
      },
    });

    const averageAnsweredTime = await calculateAverageHandlingTime(todyCdrs);

    return averageAnsweredTime;
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
    { startDate, endDate, queueId },
    { models, user }: IContext,
  ) {
    const queues = await models.CallIntegrations.getIntegrationQueuesByUser(
      user._id,
    );

    const isContainsQueue = queueId && queues.includes(queueId);
    if (!isContainsQueue && queueId) {
      return [];
    }
    const matchStage = {
      userfield: 'Inbound',
      start: { $gte: new Date(startDate) },
      end: { $lte: new Date(endDate) },
    };

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
    { startDate, endDate, queueId },
    { models, user }: IContext,
  ) {
    console.log('called agent stats');
  },
};
markResolvers(callQueries, {
  wrapperConfig: {
    skipPermission: true,
  },
});
export default callQueries;
