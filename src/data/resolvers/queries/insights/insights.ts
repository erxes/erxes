import { ConversationMessages, Conversations, Integrations, Tags } from '../../../../db/models';
import { IUserDocument } from '../../../../db/models/definitions/users';
import { FACEBOOK_DATA_KINDS, INTEGRATION_KIND_CHOICES, TAG_TYPES } from '../../../constants';
import { moduleCheckPermission, moduleRequireLogin } from '../../../permissions';
import { getDateFieldAsStr, getDurationField } from '../aggregationUtils';
import { IListArgs, IPieChartData } from './types';
import {
  fixChartData,
  fixDates,
  generateChartDataByCollection,
  generateChartDataBySelector,
  generatePunchData,
  generateResponseData,
  getConversationSelector,
  getFilterSelector,
  getMessageSelector,
  getSummaryData,
  getSummaryDates,
  getTimezone,
  noConversationSelector,
} from './utils';

const insightQueries = {
  /**
   * Builds insights charting data contains
   * count of conversations in various integrations kinds.
   */
  async insightsIntegrations(_root, args: IListArgs) {
    const filterSelector = getFilterSelector(args);

    const conversationSelector = await getConversationSelector(filterSelector);

    const integrations: IPieChartData[] = [];

    // count conversations by each integration kind
    for (const kind of INTEGRATION_KIND_CHOICES.ALL) {
      const integrationIds = await Integrations.find({
        ...filterSelector.integration,
        kind,
      }).select('_id');

      // find conversation counts of given integrations
      const value = await Conversations.countDocuments({
        ...conversationSelector,
        integrationId: { $in: integrationIds },
      });

      if (value > 0) {
        if (kind === INTEGRATION_KIND_CHOICES.FACEBOOK) {
          const { FEED, MESSENGER } = FACEBOOK_DATA_KINDS;

          const feedCount = await Conversations.countDocuments({
            ...conversationSelector,
            integrationId: { $in: integrationIds },
            'facebookData.kind': FEED,
          });

          integrations.push({
            id: `${kind} ${FEED}`,
            label: `${kind} ${FEED}`,
            value: feedCount,
          });

          integrations.push({
            id: `${kind} ${MESSENGER}`,
            label: `${kind} ${MESSENGER}`,
            value: value - feedCount,
          });
        } else {
          integrations.push({ id: kind, label: kind, value });
        }
      }
    }

    return integrations;
  },

  /**
   * Builds insights charting data contains
   * count of conversations in various integrations tags.
   */
  async insightsTags(_root, args: IListArgs) {
    const filterSelector = getFilterSelector(args);

    const conversationSelector = {
      createdAt: filterSelector.createdAt,
      ...noConversationSelector,
    };

    const tagDatas: IPieChartData[] = [];

    const tags = await Tags.find({ type: TAG_TYPES.CONVERSATION }).select('name');

    const integrationIdsByTag = await Integrations.find(filterSelector.integration).select('_id');

    const rawIntegrationIdsByTag = integrationIdsByTag.map(row => row._id);

    const tagData = await Conversations.aggregate([
      {
        $match: {
          ...conversationSelector,
          integrationId: { $in: rawIntegrationIdsByTag },
        },
      },
      {
        $unwind: '$tagIds',
      },
      {
        $group: {
          _id: '$tagIds',
          count: { $sum: 1 },
        },
      },
    ]);

    const tagDictionaryData = {};

    tagData.forEach(row => {
      tagDictionaryData[row._id] = row.count;
    });

    // count conversations by each tag
    for (const tag of tags) {
      // find conversation counts of given tag
      const value = tagDictionaryData[tag._id];
      if (tag._id in tagDictionaryData) {
        tagDatas.push({ id: tag.name, label: tag.name, value });
      }
    }

    return tagDatas;
  },

  /**
   * Counts conversations by each hours in each days.
   */
  async insightsPunchCard(_root, args: IListArgs, { user }: { user: IUserDocument }) {
    const messageSelector = await getMessageSelector({ args });

    return generatePunchData(ConversationMessages, messageSelector, user);
  },

  /**
   * Sends combined charting data for trends.
   */
  async insightsTrend(_root, args: IListArgs) {
    const messageSelector = await getMessageSelector({ args });

    return generateChartDataBySelector({ selector: messageSelector });
  },

  /**
   * Sends summary datas.
   */
  async insightsSummaryData(_root, args: IListArgs) {
    const selector = await getMessageSelector({
      args,
      createdAt: getSummaryDates(args.endDate),
    });

    const { startDate, endDate } = args;
    const { start, end } = fixDates(startDate, endDate);

    return getSummaryData({
      start,
      end,
      collection: ConversationMessages,
      selector,
    });
  },

  /**
   * Sends combined charting data for trends and summaries.
   */
  async insightsConversation(_root, args: IListArgs) {
    const filterSelector = getFilterSelector(args);

    const selector = await getConversationSelector(filterSelector);

    const conversations = await Conversations.find(selector);

    const insightData: any = {
      summary: [],
      trend: await generateChartDataByCollection(conversations),
    };

    const { startDate, endDate } = args;
    const { start, end } = fixDates(startDate, endDate);

    insightData.summary = await getSummaryData({
      start,
      end,
      collection: Conversations,
      selector,
    });

    return insightData;
  },

  /**
   * Calculates average first response time for each team members.
   */
  async insightsFirstResponse(_root, args: IListArgs) {
    const { startDate, endDate } = args;
    const filterSelector = getFilterSelector(args);
    const { start, end } = fixDates(startDate, endDate);

    const conversationSelector = {
      firstRespondedUserId: { $exists: true },
      firstRespondedDate: { $exists: true },
      messageCount: { $gt: 1 },
      createdAt: { $gte: start, $lte: end },
    };

    const insightData = { teamMembers: [], trend: [] };

    // Variable that holds all responded conversation messages
    const firstResponseData: any = [];

    // Variables holds every user's response time.
    const responseUserData: any = {};

    let allResponseTime = 0;

    const selector = await getConversationSelector(filterSelector, conversationSelector);

    const conversations = await Conversations.find(selector);

    if (conversations.length < 1) {
      return insightData;
    }

    const summaries = [0, 0, 0, 0];

    // Processes total first response time for each users.
    for (const conversation of conversations) {
      const { firstRespondedUserId, firstRespondedDate, createdAt } = conversation;

      let responseTime = 0;

      // checking wheter or not this is actual conversation
      if (firstRespondedDate && firstRespondedUserId) {
        responseTime = createdAt.getTime() - firstRespondedDate.getTime();
        responseTime = Math.abs(responseTime / 1000);

        const userId = firstRespondedUserId;

        // collecting each user's respond information
        firstResponseData.push({
          createdAt: firstRespondedDate,
          userId,
          responseTime,
        });

        allResponseTime += responseTime;

        // Builds every users's response time and conversation message count.
        if (responseUserData[userId]) {
          responseUserData[userId].responseTime = responseTime + responseUserData[userId].responseTime;
          responseUserData[userId].count = responseUserData[userId].count + 1;
        } else {
          responseUserData[userId] = {
            responseTime,
            count: 1,
            summaries: [0, 0, 0, 0],
          };
        }

        const minute = Math.floor(responseTime / 60);
        const index = minute < 3 ? minute : 3;

        summaries[index] = summaries[index] + 1;
        responseUserData[userId].summaries[index] = responseUserData[userId].summaries[index] + 1;
      }
    }

    const doc = await generateResponseData(firstResponseData, responseUserData, allResponseTime);

    return { ...doc, summaries };
  },

  /**
   * Calculates average response close time for each team members.
   */
  async insightsResponseClose(_root, args: IListArgs, { user }: { user: IUserDocument }) {
    const { startDate, endDate } = args;
    const { start, end } = fixDates(startDate, endDate);

    const conversationSelector = {
      createdAt: { $gte: start, $lte: end },
      closedAt: { $exists: true },
      closedUserId: { $exists: true },
    };

    const conversationMatch = await getConversationSelector(getFilterSelector(args), { ...conversationSelector });

    const insightAggregateData = await Conversations.aggregate([
      {
        $match: conversationMatch,
      },
      {
        $project: {
          responseTime: getDurationField({ startField: '$closedAt', endField: '$createdAt' }),
          date: await getDateFieldAsStr({ timeZone: getTimezone(user) }),
          closedUserId: 1,
        },
      },
      {
        $group: {
          _id: {
            closedUserId: '$closedUserId',
            date: '$date',
          },
          totalResponseTime: { $sum: '$responseTime' },
          avgResponseTime: { $avg: '$responseTime' },
          count: { $sum: 1 },
        },
      },
      {
        $project: {
          _id: 0,
          closedUserId: '$_id.closedUserId',
          date: '$_id.date',
          totalResponseTime: 1,
          avgResponseTime: 1,
          count: 1,
        },
      },
      {
        $lookup: {
          from: 'users',
          localField: 'closedUserId',
          foreignField: '_id',
          as: 'userDoc',
        },
      },
      {
        $replaceRoot: { newRoot: { $mergeObjects: [{ $arrayElemAt: ['$userDoc.details', 0] }, '$$ROOT'] } },
      },
      {
        $group: {
          _id: '$closedUserId',
          responseTime: { $sum: '$totalResponseTime' },
          avgResponseTime: { $avg: '$avgResponseTime' },
          count: { $sum: '$count' },
          fullName: { $first: '$fullName' },
          avatar: { $first: '$avatar' },
          chartDatas: {
            $push: {
              date: '$date',
              count: '$count',
            },
          },
        },
      },
    ]);

    // Variables holds every user's response time.
    const teamMembers: any = [];
    const responseUserData: any = {};

    let allResponseTime = 0;
    let totalCount = 0;
    const aggregatedTrend = {};

    for (const userData of insightAggregateData) {
      // responseUserData
      responseUserData[userData._id] = {
        responseTime: userData.responseTime,
        count: userData.count,
        avgResponseTime: userData.avgResponseTime,
        fullName: userData.fullName,
        avatar: userData.avatar,
      };
      // team members gather
      const fixedChartData = await fixChartData(userData.chartDatas, 'date', 'count');
      userData.chartDatas.forEach(row => {
        if (row.date in aggregatedTrend) {
          aggregatedTrend[row.date] += row.count;
        } else {
          aggregatedTrend[row.date] = row.count;
        }
      });

      teamMembers.push({
        data: {
          fullName: userData.fullName,
          avatar: userData.avatar,
          graph: fixedChartData,
        },
      });
      // calculate allResponseTime to render average responseTime
      allResponseTime += userData.responseTime;
      totalCount += userData.count;
    }

    if (insightAggregateData.length < 1) {
      return { teamMembers: [], trend: [] };
    }

    const trend = await fixChartData(
      Object.keys(aggregatedTrend)
        .sort()
        .map(key => {
          return { date: key, count: aggregatedTrend[key] };
        }),
      'date',
      'count',
    );
    const time = Math.floor(allResponseTime / totalCount);

    return { trend, teamMembers, time };
  },
};

moduleRequireLogin(insightQueries);

moduleCheckPermission(insightQueries, 'showInsights');

export default insightQueries;
