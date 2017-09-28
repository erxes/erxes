import { Integrations, Conversations, ConversationMessages } from '../../../db/models';
import moment from 'moment';
import _ from 'underscore';
import { INTEGRATION_KIND_CHOICES } from '../../constants';
import {
  fixDates,
  generateMessageSelector,
  generateTimeIntervals,
  generateUserData,
  generateDuration,
  generateChartData,
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

    const conversationSelector = {
      messageCount: { $ne: null },
      createdAt: { $gte: new Date(start), $lte: new Date(end) },
    };

    const integrationSelector = {};

    if (brandId) {
      integrationSelector.brandId = brandId;
    }

    const insights = [];

    for (let kind of INTEGRATION_KIND_CHOICES.ALL_LIST) {
      const integrationIds = await Integrations.find({ ...integrationSelector, kind }).select(
        '_id',
      );

      insights.push({
        name: kind,
        value: await Conversations.find({
          ...conversationSelector,
          integrationId: { $in: integrationIds },
        }).count(),
      });
    }

    return insights;
  },

  /**
   * Prepares punch card data for conversation messages.
   * @param {Object} args
   * @param {String} args.type
   * @param {String} args.brandId
   * @param {String} args.endDate
   * @param {String} args.integrationType
   * @return {Promise} Punch card data
  */
  async insightsPunchCard(root, { type, integrationType, brandId, endDate }) {
    let volumeOrResponse = null;

    if (type === 'response') {
      volumeOrResponse = { $ne: null };
    }

    if (!endDate) {
      endDate = new Date();
    }

    const end = moment(endDate).format('YYYY-MM-DD');
    const start = moment(end).add(-7, 'days');

    const messageSelector = await generateMessageSelector(
      brandId,
      integrationType,
      // conversation selector
      {},
      // message selector
      {
        userId: volumeOrResponse,
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

      count = messages.filter(
        message => startTime < message.createdAt && message.createdAt < endTime,
      ).length;

      dayCount = startTime.weekday();

      if (count > 0) {
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
    let volumeOrResponse = null;

    if (type === 'response') {
      volumeOrResponse = { $ne: null };
    }

    const { start, end } = fixDates(startDate, endDate);
    const { duration, startTime } = generateDuration({ start, end });

    const messageSelector = await generateMessageSelector(
      brandId,
      integrationType,
      // conversation selector
      {},
      // message selector
      {
        userId: volumeOrResponse,
        createdAt: {
          $gte: new Date(start),
          $lte: new Date(end),
        },
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

      // extracts unique team members data from messages collections.
      for (let userId of userIds) {
        insightData.teamMembers.push({
          data: await generateUserData({
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
        createdAt: { $gte: new Date(start), $lte: new Date(end) },
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

      if (userMessage && clientMessage) {
        responseTime = getTime(userMessage.createdAt) - getTime(clientMessage.createdAt);
        responseTime = parseInt(responseTime / 1000);

        const userId = userMessage.userId;

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

    insightData.trend = generateChartData(firstResponseData, 10, duration, startTime);

    // Average response time for all messages
    insightData.time = parseInt(allResponseTime / firstResponseData.length);

    const userIds = _.uniq(_.pluck(firstResponseData, 'userId'));

    for (let userId of userIds) {
      // Average response time for users.
      let time = responseUserData[userId].responseTime / responseUserData[userId].count;

      insightData.teamMembers.push({
        data: await generateUserData({
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
