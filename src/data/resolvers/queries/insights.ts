import * as moment from 'moment';
import { ConversationMessages, Conversations, Integrations, Tags } from '../../../db/models';
import { FACEBOOK_DATA_KINDS, INTEGRATION_KIND_CHOICES, TAG_TYPES } from '../../constants';
import { moduleRequireLogin } from '../../permissions';
import {
  findConversations,
  fixDate,
  fixDates,
  formatTime,
  generateChartData,
  generateDuration,
  generateMessageSelector,
  generateResponseData,
  generateTimeIntervals,
  generateUserSelector,
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

    const insights: { integration: IPieChartData[]; tag: IPieChartData[] } = { integration: [], tag: [] };

    const conversationSelector = {
      createdAt: { $gte: start, $lte: end },
      $or: [{ userId: { $exists: true }, messageCount: { $gt: 1 } }, { userId: { $exists: false } }],
    };

    // count conversations by each integration kind
    for (const kind of INTEGRATION_KIND_CHOICES.ALL) {
      const integrationIds = await Integrations.find({ ...integrationSelector, kind }).select('_id');

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

    // count conversations by each tag
    for (const tag of tags) {
      // find conversation counts of given tag
      const value = await Conversations.countDocuments({
        ...conversationSelector,
        integrationId: { $in: integrationIdsByTag },
        tagIds: tag._id,
      });

      if (value > 0) {
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
    const punchCard: any = [];

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
        },
      },
      {
        $group: {
          _id: {
            hour: '$hour',
            day: '$day',
          },
          count: { $sum: 1 },
        },
      },
      {
        $project: {
          _id: 0,
          day: '$_id.day',
          hour: '$_id.hour',
          count: 1,
        },
      },
    ]);
    punchData.map(data => {
      punchCard.push([data.day, data.hour % 24, data.count]);
    });

    return punchCard;
  },

  /**
   * Sends combined charting data for trends, summaries and team members.
   */
  async insightsMain(_root, args: IListArgs) {
    const { type, integrationType, brandId, startDate, endDate } = args;
    const { start, end } = fixDates(startDate, endDate);
    const { duration, startTime } = generateDuration({ start, end });

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
      },
    );

    const insightData: any = {
      summary: [],
      trend: await generateChartData({
        messageSelector,
        loopCount: 7,
        duration,
        startTime,
      }),
    };

    const summaries = generateTimeIntervals(start, end);

    // finds a respective message counts for different time intervals.
    for (const summary of summaries) {
      messageSelector.createdAt = {
        $gt: formatTime(summary.start),
        $lte: formatTime(summary.end),
      };

      insightData.summary.push({
        title: summary.title,
        count: await ConversationMessages.countDocuments(messageSelector),
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
    const { duration, startTime } = generateDuration({ start, end });

    const conversationSelector = {
      createdAt: { $gt: start, $lte: end },
      $or: [{ userId: { $exists: true }, messageCount: { $gt: 1 } }, { userId: { $exists: false } }],
    };

    const conversations = await findConversations({ kind: integrationType, brandId }, conversationSelector);
    const insightData: any = {
      summary: [],
      trend: await generateChartData({
        collection: conversations,
        loopCount: 7,
        duration,
        startTime,
      }),
    };

    const summaries = generateTimeIntervals(start, end);

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
    const { duration, startTime } = generateDuration({ start, end });

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
        firstResponseData.push({ createdAt: firstRespondedDate, userId, responseTime });

        allResponseTime += responseTime;

        // Builds every users's response time and conversation message count.
        if (responseUserData[userId]) {
          responseUserData[userId].responseTime = responseTime + responseUserData[userId].responseTime;
          responseUserData[userId].count = responseUserData[userId].count + 1;
        } else {
          responseUserData[userId] = { responseTime, count: 1, summaries: [0, 0, 0, 0] };
        }

        const minute = Math.floor(responseTime / 60);
        const index = minute < 3 ? minute : 3;

        summaries[index] = summaries[index] + 1;
        responseUserData[userId].summaries[index] = responseUserData[userId].summaries[index] + 1;
      }
    }

    const doc = await generateResponseData(firstResponseData, responseUserData, allResponseTime, duration, startTime);

    return { ...doc, summaries };
  },

  /**
   * Calculates average response close time for each team members.
   */
  async insightsResponseClose(_root, args: IListArgs) {
    const { integrationType, brandId, startDate, endDate } = args;
    const { start, end } = fixDates(startDate, endDate);
    const { duration, startTime } = generateDuration({ start, end });

    const conversationSelector = {
      createdAt: { $gte: start, $lte: end },
      closedAt: { $ne: null },
      closedUserId: { $ne: null },
    };

    const conversations = await findConversations({ kind: integrationType, brandId }, conversationSelector);
    const insightData = { teamMembers: [], trend: [] };

    // If conversation not found.
    if (conversations.length < 1) {
      return insightData;
    }

    // Variable that holds all responded conversation messages
    const responseCloseData: any = [];

    // Variables holds every user's response time.
    const responseUserData: any = {};

    let allResponseTime = 0;

    // Processes total first response time for each users.
    for (const conversation of conversations) {
      let responseTime = 0;
      if (conversation.closedAt) {
        responseTime = conversation.closedAt.getTime() - conversation.createdAt.getTime();
        responseTime = responseTime / 1000;
      }

      const userId = conversation.closedUserId || '';

      // collecting each user's respond information
      responseCloseData.push({
        createdAt: conversation.createdAt,
        userId,
        responseTime,
      });

      allResponseTime += responseTime;

      let count = 1;

      // Builds every users's response time and conversation message count.
      if (responseUserData[userId]) {
        responseTime = responseTime + responseUserData[userId].responseTime;
        count = responseUserData[userId].count + 1;
      }

      responseUserData[userId] = { responseTime, count };
    }

    return generateResponseData(responseCloseData, responseUserData, allResponseTime, duration, startTime);
  },
};

moduleRequireLogin(insightQueries);

export default insightQueries;
