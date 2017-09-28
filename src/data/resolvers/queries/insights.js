import { Integrations, Conversations, ConversationMessages, Users } from '../../../db/models';
import moment from 'moment';
import _ from 'underscore';
import { INTEGRATION_KIND_CHOICES } from '../../constants';

/**
 * Builds messages find query selector.
 * @param {Object} args
 * @param {String} args.brandId
 * @param {String} args.integrationType
 * @param {Object} args.conversationSelector
 * @param {Object} args.messageSelector
 * @return {Promise} find input argument object.
*/
const generateMessageSelector = async (
  brandId,
  integrationType,
  conversationSelector,
  messageSelector,
) => {
  const selector = messageSelector;

  const findConversationIds = async integrationSelector => {
    const integrationIds = await Integrations.find(integrationSelector).select('_id');
    const conversationIds = await Conversations.find({
      ...conversationSelector,
      integrationId: { $in: integrationIds },
    }).select('_id');

    selector.conversationId = { $in: conversationIds };
  };

  const integrationSelector = {};

  if (brandId) {
    integrationSelector.brandId = brandId;
  }

  if (integrationType) {
    integrationSelector.kind = integrationType;
  }

  await findConversationIds(integrationSelector);

  return selector;
};

/**
 * Populates message collection into date range 
 * by given duration and loop count for chart data.
 * @param {Object} args
 * @param {MessagesList} args.collection
 * @param {Integer} args.loopCount
 * @param {Integer} args.duration
 * @param {Integer} args.starTime
 * @return {[Object]} Chart data
*/
const insertData = (collection, loopCount, duration, startTime) => {
  const results = [];
  let begin = 0;
  let end = 0;
  let count = 0;
  let dateText = null;

  // Variable that represents time interval by steps.
  const divider = duration / loopCount;

  for (let i = 0; i < loopCount; i++) {
    end = startTime + divider * (i + 1);
    begin = end - divider;
    dateText = moment(begin).format('YYYY-MM-DD');

    // messages count between begin and end time.
    count = collection.filter(message => begin < message.createdAt && message.createdAt < end)
      .length;

    results.push({ name: dateText, count });
  }
  return results;
};

const formatTime = time => {
  return time.format('YYYY-MM-DD HH:mm:ss');
};

const getTime = time => {
  return new Date(time).getTime();
};

const fixDates = (startDate, endDate) => {
  if (!startDate || !endDate) {
    endDate = new Date();
    const year = moment(endDate).year();
    startDate = moment(endDate).year(year - 1);
  }

  return { start: startDate, end: endDate };
};

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
      {},
      {
        userId: volumeOrResponse,
        createdAt: { $gte: start, $lte: end },
      },
    );

    const messages = await ConversationMessages.find(messageSelector);

    const punchCard = [];

    let count = 0;
    let startTime = null;
    let endTime = null;
    let dayCount = 0;

    // insert hourly message counts for all week duration
    // into punch card array.
    for (let i = 0; i < 7 * 24; i++) {
      startTime = moment(start).add(i, 'hours');
      endTime = moment(start).add(i + 1, 'hours');

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
    const startTime = getTime(start);
    const endTime = getTime(end);
    const duration = endTime - startTime;

    const messageSelector = await generateMessageSelector(
      brandId,
      integrationType,
      {},
      {
        userId: volumeOrResponse,
        createdAt: {
          $gte: new Date(start),
          $lte: new Date(end),
        },
      },
    );

    const messages = await ConversationMessages.find(messageSelector);

    const insightData = { teamMembers: [], summary: [] };
    insightData.trend = insertData(messages, 10, duration, startTime);

    if (type === 'response') {
      const userIds = _.uniq(_.pluck(messages, 'userId'));
      let user = null;
      let userMessages = null;
      let userDetail = null;
      let userData = null;
      let data = null;

      // extracts unique team members data from messages collections.
      for (let userId of userIds) {
        user = await Users.findOne({ _id: userId });
        if (user) {
          userMessages = messages.filter(message => userId === message.userId);
          userDetail = user.details;
          userData = insertData(userMessages, 5, duration, startTime);
          data = {
            fullName: userDetail.fullName,
            avatar: userDetail.avatar,
            graph: userData,
          };
          insightData.teamMembers.push(data);
        }
      }
    }

    const month = moment(end).month();
    const summaries = [
      {
        title: 'In time range',
        start: moment(start),
        end: moment(end),
      },
      {
        title: 'This month',
        start: moment(1, 'DD'),
        end: moment(),
      },
      {
        title: 'This week',
        start: moment(end).weekday(0),
        end: moment(end),
      },
      {
        title: 'Today',
        start: moment(end).add(-1, 'days'),
        end: moment(end),
      },
      {
        title: 'Last 30 days',
        start: moment(end).add(-30, 'days'),
        end: moment(end),
      },
      {
        title: 'Last month',
        start: moment(month, 'MM'),
        end: moment(month + 1, 'MM'),
      },
      {
        title: 'Last week',
        start: moment(end).weekday(-7),
        end: moment(end).weekday(0),
      },
      {
        title: 'Yesterday',
        start: moment(end).add(-2, 'days'),
        end: moment(end).add(-1, 'days'),
      },
    ];

    // finds a respective message counts for different time intervals.
    for (let summary of summaries) {
      messageSelector.createdAt = { $gt: formatTime(summary.start), $lte: formatTime(summary.end) };
      const count = await ConversationMessages.find(messageSelector).count();
      const data = { title: summary.title, count };
      insightData.summary.push(data);
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

    const startTime = getTime(start);
    const endTime = getTime(end);
    const duration = endTime - startTime;

    const messageSelector = await generateMessageSelector(
      brandId,
      integrationType,
      {
        messageCount: { $gt: 2 },
        createdAt: { $gte: new Date(start), $lte: new Date(end) },
      },
      { createdAt: { $ne: null } },
    );

    const insightData = { teamMembers: [], trend: [] };

    // Variable that holds all responded conversation messages
    const firstResponseData = [];

    // Variables holds every user's response time.
    const responseUserData = {};
    let allResponseTime = 0;

    // If conversation was found that above search criteria.
    if (messageSelector.conversationId && messageSelector.conversationId.$in) {
      const conversationIds = messageSelector.conversationId.$in;
      let clientMessage = {};
      let userMessage = {};
      let responseTime = 0;
      let userId = null;
      let count = 0;

      // Processes total first response time for each users.
      for (let conversationId of conversationIds) {
        messageSelector.conversationId = conversationId;
        messageSelector.userId = null;

        // Client first response message
        clientMessage = await ConversationMessages.findOne(messageSelector).sort({ createdAt: 1 });
        messageSelector.userId = { $ne: null };

        // First message that answered to a conversation
        userMessage = await ConversationMessages.findOne(messageSelector).sort({ createdAt: 1 });

        if (userMessage && clientMessage) {
          responseTime = getTime(userMessage.createdAt) - getTime(clientMessage.createdAt);
          responseTime = parseInt(responseTime / 1000);
          userId = userMessage.userId;

          firstResponseData.push({
            createdAt: userMessage.createdAt,
            userId,
            responseTime,
          });

          allResponseTime = allResponseTime + responseTime;

          // Builds every users's response time and conversation message count.
          if (responseUserData[userId]) {
            responseTime = responseTime + responseUserData[userId].responseTime;
            count = responseUserData[userId].count + 1;
            responseUserData[userId] = { responseTime, count };
          } else {
            responseUserData[userId] = { responseTime, count: 1 };
          }
        }
      }
    } else {
      return insightData;
    }

    insightData.trend = insertData(firstResponseData, 10, duration, startTime);

    // Average response time for all messages
    insightData.time = parseInt(allResponseTime / firstResponseData.length);

    const userIds = _.uniq(_.pluck(firstResponseData, 'userId'));
    let user = null;
    let userMessages = null;
    let userDetail = null;
    let userData = null;
    let data = null;
    let time = 0;

    for (let userId of userIds) {
      user = await Users.findOne({ _id: userId });
      if (user) {
        userMessages = firstResponseData.filter(message => userId === message.userId);
        userDetail = user.details;
        userData = insertData(userMessages, 5, duration, startTime);
        data = {
          fullName: userDetail.fullName,
          avatar: userDetail.avatar,
          graph: userData,
        };

        // Average response time for users.
        time = responseUserData[userId].responseTime / responseUserData[userId].count;
        time = parseInt(time);
        insightData.teamMembers.push({ data, time });
      }
    }

    return insightData;
  },
};
