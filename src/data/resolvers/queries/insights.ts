import * as moment from 'moment';
import { ConversationMessages, Conversations, Integrations, Tags, Users } from '../../../db/models';
import { FACEBOOK_DATA_KINDS, INTEGRATION_KIND_CHOICES, TAG_TYPES } from '../../constants';
import { moduleRequireLogin } from '../../permissions';
import {
  findConversations,
  fixChartData,
  fixDate,
  fixDates,
  formatTime,
  generateChartData,
  generateMessageSelector,
  generateResponseData,
  generateTimeIntervals,
  generateUserSelector,
  getConversationSelector,
} from './insightUtils';

interface IListArgs {
  integrationType: string;
  brandId: string;
  startDate: string;
  endDate: string;
  type: string;
}

interface IPieChartData {
  id: string;
  label: string;
  value: number;
}

const insightQueries = {
  /**
   * Builds insights charting data contains
   * count of conversations in various integrations kinds.
   */
  async insights(_root, args: IListArgs) {
    const { brandId, integrationType, startDate, endDate } = args;
    const { start, end } = fixDates(startDate, endDate);

    const integrationSelector: { brandId?: string; kind?: string } = {};

    if (brandId) {
      integrationSelector.brandId = brandId;
    }

    const insights: { integration: IPieChartData[]; tag: IPieChartData[] } = {
      integration: [],
      tag: [],
    };

    const conversationSelector = {
      createdAt: { $gte: start, $lte: end },
      $or: [{ userId: { $exists: true }, messageCount: { $gt: 1 } }, { userId: { $exists: false } }],
    };

    // count conversations by each integration kind
    for (const kind of INTEGRATION_KIND_CHOICES.ALL) {
      const integrationIds = await Integrations.find({
        ...integrationSelector,
        kind,
      }).select('_id');

      // find conversation counts of given integrations
      const value = await Conversations.countDocuments({
        ...conversationSelector,
        integrationId: { $in: integrationIds },
      });

      if (kind === INTEGRATION_KIND_CHOICES.FACEBOOK) {
        const { FEED, MESSENGER } = FACEBOOK_DATA_KINDS;

        const feedCount = await Conversations.countDocuments({
          ...conversationSelector,
          integrationId: { $in: integrationIds },
          'facebookData.kind': FEED,
        });

        insights.integration.push({
          id: `${kind} ${FEED}`,
          label: `${kind} ${FEED}`,
          value: feedCount,
        });

        insights.integration.push({
          id: `${kind} ${MESSENGER}`,
          label: `${kind} ${MESSENGER}`,
          value: value - feedCount,
        });
      } else {
        insights.integration.push({ id: kind, label: kind, value });
      }
    }

    const tags = await Tags.find({ type: TAG_TYPES.CONVERSATION }).select('name');

    if (integrationType) {
      integrationSelector.kind = integrationType;
    }

    const integrationIdsByTag = await Integrations.find(integrationSelector).select('_id');
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
    tagData.map(row => {
      tagDictionaryData[row._id] = row.count;
    });
    // count conversations by each tag
    for (const tag of tags) {
      // find conversation counts of given tag
      const value = tagDictionaryData[tag._id];
      if (tag._id in tagDictionaryData) {
        insights.tag.push({ id: tag.name, label: tag.name, value });
      }
    }
    return insights;
  },

  /**
   * Counts conversations by each hours in each days.
   */
  async insightsPunchCard(_root, args: IListArgs) {
    const { type, integrationType, brandId, endDate } = args;

    // check & convert endDate's value
    const end = moment(fixDate(endDate)).format('YYYY-MM-DD');
    const start = moment(end).add(-7, 'days');

    const conversationIds = await findConversations(
      { brandId, kind: integrationType },
      {
        createdAt: { $gte: start, $lte: end },
      },
      true,
    );

    const rawConversationIds = conversationIds.map(obj => obj._id);
    const matchMessageSelector = {
      conversationId: { $in: rawConversationIds },
      fromBot: { $exists: false },
      // client or user
      userId: generateUserSelector(type),
      createdAt: { $gte: start.toDate(), $lte: new Date(end) },
    };

    // TODO: need improvements on timezone calculation.
    const punchData = await ConversationMessages.aggregate([
      {
        $match: matchMessageSelector,
      },
      {
        $project: {
          hour: { $hour: { date: '$createdAt', timezone: '+08' } },
          day: { $isoDayOfWeek: { date: '$createdAt', timezone: '+08' } },
          date: {
            $dateToString: {
              format: '%Y-%m-%d',
              date: '$createdAt',
              // timezone: "+08"
            },
          },
        },
      },
      {
        $group: {
          _id: {
            hour: '$hour',
            day: '$day',
            date: '$date',
          },
          count: { $sum: 1 },
        },
      },
      {
        $project: {
          _id: 0,
          day: '$_id.day',
          hour: '$_id.hour',
          date: '$_id.date',
          count: 1,
        },
      },
    ]);

    return punchData;
  },

  /**
   * Sends combined charting data for trends, summaries and team members.
   */
  async insightsMain(_root, args: IListArgs) {
    const { type, integrationType, brandId, startDate, endDate } = args;
    const { start, end } = fixDates(startDate, endDate);

    const messageSelector = await generateMessageSelector(
      brandId,
      integrationType,
      // conversation selector
      {
        createdAt: { $gte: start, $lte: end },
      },
      // message selector
      {
        userId: generateUserSelector(type),
        createdAt: { $gte: start, $lte: end },
        // exclude bot messages
        fromBot: { $exists: false },
      },
    );

    const insightData: any = {
      summary: [],
      trend: await generateChartData({ messageSelector }),
    };

    const summaries = generateTimeIntervals(start, end);
    const facets = {};
    // finds a respective message counts for different time intervals.
    for (const summary of summaries) {
      messageSelector.createdAt = {
        $gt: summary.start.toDate(),
        $lte: summary.end.toDate(),
      };
      facets[summary.title] = [
        {
          $match: {
            userId: generateUserSelector(type),
            createdAt: { $gte: summary.start.toDate(), $lte: summary.end.toDate() },
            // exclude bot messages
            fromBot: { $exists: false },
          },
        },
        {
          $group: {
            _id: null,
            count: { $sum: 1 },
          },
        },
        {
          $project: {
            _id: 0,
            count: 1,
          },
        },
      ];
    }
    const data = await ConversationMessages.aggregate([
      {
        $facet: facets,
      },
    ]);
    for (const summary of summaries) {
      const count = data['0'][summary.title][0] ? data['0'][summary.title][0].count : 0;
      insightData.summary.push({
        title: summary.title,
        count,
      });
    }

    return insightData;
  },

  /**
   * Sends combined charting data for trends and summaries.
   */
  async insightsConversation(_root, args: IListArgs) {
    const { integrationType, brandId, startDate, endDate } = args;
    const { start, end } = fixDates(startDate, endDate);

    const conversationSelector = {
      createdAt: { $gt: start, $lte: end },
      $or: [{ userId: { $exists: true }, messageCount: { $gt: 1 } }, { userId: { $exists: false } }],
    };

    const conversations = await findConversations({ kind: integrationType, brandId }, conversationSelector);
    const insightData: any = {
      summary: [],
      trend: await generateChartData({ collection: conversations }),
    };

    const summaries = generateTimeIntervals(start, end);
    console.log(summaries);

    // finds a respective message counts for different time intervals.
    for (const summary of summaries) {
      conversationSelector.createdAt = {
        $gt: formatTime(summary.start),
        $lte: formatTime(summary.end),
      };

      insightData.summary.push({
        title: summary.title,
        count: await Conversations.countDocuments(conversationSelector),
      });
    }

    return insightData;
  },

  /**
   * Calculates average first response time for each team members.
   */
  async insightsFirstResponse(_root, args: IListArgs) {
    const { integrationType, brandId, startDate, endDate } = args;
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

    const conversations = await findConversations({ kind: integrationType, brandId }, conversationSelector);

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
  async insightsResponseClose(_root, args: IListArgs) {
    const { integrationType, brandId, startDate, endDate } = args;
    const { start, end } = fixDates(startDate, endDate);

    const conversationSelector = {
      createdAt: { $gte: start, $lte: end },
      closedAt: { $ne: null },
      closedUserId: { $ne: null },
    };

    const conversationMatch = await getConversationSelector({ kind: integrationType, brandId }, conversationSelector);
    const insightAggregateData = await Conversations.aggregate([
      {
        $match: conversationMatch,
      },
      {
        $match: {
          closedAt: { $exists: true },
        },
      },
      {
        $project: {
          responseTime: {
            $divide: [{ $subtract: ['$closedAt', '$createdAt'] }, 1000],
          },
          date: {
            $dateToString: {
              format: '%Y-%m-%d',
              date: '$createdAt',
              // timezone: "+08"
            },
          },
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
        $group: {
          _id: '$closedUserId',
          responseTime: { $sum: '$totalResponseTime' },
          avgResponseTime: { $avg: '$avgResponseTime' },
          count: { $sum: '$count' },
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
      };
      // team members gather
      const fixedChartData = await fixChartData(userData.chartDatas, 'date', 'count');
      const user = await Users.findOne({ _id: userData._id });
      userData.chartDatas.map(row => {
        if (row.date in aggregatedTrend) {
          aggregatedTrend[row.date] += row.count;
        } else {
          aggregatedTrend[row.date] = row.count;
        }
      });
      if (!user) {
        continue;
      }
      const userDetail = user.details;
      teamMembers.push({
        data: {
          fullName: userDetail ? userDetail.fullName : '',
          avatar: userDetail ? userDetail.avatar : '',
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

export default insightQueries;
