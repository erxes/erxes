import { Integrations, Conversations, ConversationMessages } from '../../../db/models';
import moment from 'moment';
import _ from 'underscore';
import { INTEGRATION_KIND_CHOICES } from '../../constants';
import {
  fixDate,
  fixDates,
  generateMessageSelector,
  generateTimeIntervals,
  generateUserChartData,
  generateDuration,
  generateChartData,
  generateUserSelector,
  getTime,
  formatTime,
} from './insightUtils';

export default {
  /**
   * Builds insights charting data contains
   * count of conversations in various integrations kinds.
   * @param {Object} args
   * @param {String} args.brandId
   * @param {String} args.startDate
   * @param {String} args.endDate
   * @return {Promise} Array of conversation counts.
  */
  async insights(root, { brandId, startDate, endDate }) {
    const { start, end } = fixDates(startDate, endDate);

    const integrationSelector = {};

    if (brandId) {
      integrationSelector.brandId = brandId;
    }

    const insights = [];

    // count conversations by each integration kind
    for (let kind of INTEGRATION_KIND_CHOICES.ALL_LIST) {
      const integrationIds = await Integrations.find({ ...integrationSelector, kind }).select(
        '_id',
      );

      insights.push({
        name: kind,

        // find conversation counts of given integrations
        value: await Conversations.find({
          messageCount: { $ne: null },
          createdAt: { $gte: start, $lte: end },
          integrationId: { $in: integrationIds },
        }).count(),
      });
    }

    return insights;
  },

  /**
   * Counts conversations by each hours in each days.
   * @param {Object} args
   * @param {String} args.type
   * @param {String} args.brandId
   * @param {String} args.endDate
   * @param {String} args.integrationType
   * @return {Promise} Punch card data
  */
  async insightsPunchCard(root, { type, integrationType, brandId, endDate }) {
    // check & convert endDate's value
    const end = moment(fixDate(endDate)).format('YYYY-MM-DD');
    const start = moment(end).add(-7, 'days');

    const messageSelector = await generateMessageSelector(
      brandId,
      integrationType,
      // conversation selector
      {},
      // message selector
      {
        // client or user
        userId: generateUserSelector(type),

        // last 7 days
        createdAt: { $gte: start, $lte: end },
      },
    );

    const messages = await ConversationMessages.find(messageSelector);

    const punchCard = [];

    let count = 0;
    let dayCount = 0;

    // insert hourly message counts for all week duration
    // into punch card array.
    for (let i = 0; i < 7 * 24; i++) {
      const startTime = moment(start).add(i, 'hours');
      const endTime = moment(start).add(i + 1, 'hours');

      // counting messages in one hour
      count = messages.filter(
        message => startTime < message.createdAt && message.createdAt < endTime,
      ).length;

      dayCount = startTime.weekday();

      if (count > 0) {
        // 1(Monday), 1(am), 20 messages
        punchCard.push([dayCount, i % 24, count]);
      }
    }

    return punchCard;
  },

  /**
   * Sends combined charting data for trends, summaries and team members.
   * @param {Object} args
   * @param {String} args.brandId
   * @param {String} args.type
   * @param {String} args.startDate
   * @param {String} args.endDate
   * @return {Promise} Object data { trend: [Object], teamMembers: [Object], summary: [] }
  */
  async insightsMain(root, { type, integrationType, brandId, startDate, endDate }) {
    const { start, end } = fixDates(startDate, endDate);
    const { duration, startTime } = generateDuration({ start, end });

    const messageSelector = await generateMessageSelector(
      brandId,
      integrationType,
      // conversation selector
      {},
      // message selector
      {
        userId: generateUserSelector(type),
        createdAt: { $gte: start, $lte: end },
      },
    );

    const messages = await ConversationMessages.find(messageSelector);

    const insightData = {
      teamMembers: [],
      summary: [],
      trend: generateChartData(messages, 10, duration, startTime),
    };

    if (type === 'response') {
      const userIds = _.uniq(_.pluck(messages, 'userId'));

      // generate detail and graph data for each user
      for (let userId of userIds) {
        insightData.teamMembers.push({
          data: await generateUserChartData({
            userId,
            userMessages: messages.filter(message => userId === message.userId),
            duration,
            startTime,
          }),
        });
      }
    }

    const summaries = generateTimeIntervals(start, end);

    // finds a respective message counts for different time intervals.
    for (let summary of summaries) {
      messageSelector.createdAt = {
        $gt: formatTime(summary.start),
        $lte: formatTime(summary.end),
      };

      insightData.summary.push({
        title: summary.title,
        count: await ConversationMessages.find(messageSelector).count(),
      });
    }

    return insightData;
  },

  /**
   * Calculates average first response time for each team members.
   * @param {Object} args
   * @param {String} args.brandId
   * @param {String} args.startDate
   * @param {String} args.endDate
   * @return {Promise} Object data { trend: [Object], teamMembers: [Object], summary: [] }
  */
  async insightsFirstResponse(root, { integrationType, brandId, startDate, endDate }) {
    const { start, end } = fixDates(startDate, endDate);
    const { duration, startTime } = generateDuration({ start, end });

    const messageSelector = await generateMessageSelector(
      brandId,
      integrationType,
      // conversation selector
      {
        messageCount: { $gt: 2 },
        createdAt: { $gte: start, $lte: end },
      },
      // message selector
      { createdAt: { $ne: null } },
    );

    const insightData = { teamMembers: [], trend: [] };

    // Variable that holds all responded conversation messages
    const firstResponseData = [];

    // Variables holds every user's response time.
    const responseUserData = {};

    let allResponseTime = 0;

    // If conversation was found that above search criteria.
    if (!(messageSelector.conversationId && messageSelector.conversationId.$in)) {
      return insightData;
    }

    const conversationIds = messageSelector.conversationId.$in;

    // Processes total first response time for each users.
    for (let conversationId of conversationIds) {
      // Client first response message
      const clientMessage = await ConversationMessages.findOne({
        ...messageSelector,
        conversationId,
        userId: null,
      }).sort({ createdAt: 1 });

      // First message that answered to a conversation
      const userMessage = await ConversationMessages.findOne({
        ...messageSelector,
        conversationId,
        userId: { $ne: null },
      }).sort({ createdAt: 1 });

      let responseTime = 0;

      // checking wheter or not this is actual conversation
      if (userMessage && clientMessage) {
        responseTime = getTime(userMessage.createdAt) - getTime(clientMessage.createdAt);
        responseTime = parseInt(responseTime / 1000);

        const userId = userMessage.userId;

        // collecting each user's respond information
        firstResponseData.push({
          createdAt: userMessage.createdAt,
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
    }

    // preparing trend chart data
    insightData.trend = generateChartData(firstResponseData, 10, duration, startTime);

    // Average response time for all messages
    insightData.time = parseInt(allResponseTime / firstResponseData.length);

    const userIds = _.uniq(_.pluck(firstResponseData, 'userId'));

    for (let userId of userIds) {
      // Average response time for users.
      let time = responseUserData[userId].responseTime / responseUserData[userId].count;

      // preparing each team member's chart data
      insightData.teamMembers.push({
        data: await generateUserChartData({
          userId,
          userMessages: firstResponseData.filter(message => userId === message.userId),
          duration,
          startTime,
        }),

        time: parseInt(time),
      });
    }

    return insightData;
  },
};
