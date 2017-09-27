import { Integrations, Conversations, ConversationMessages, Users } from '../../../db/models';
import moment from 'moment';
import _ from 'underscore';

/**
 * Builds messages find query selector.
 * @param {Object} args
 * @param {String} args.brandId
 * @param {String} args.integrationType
 * @param {Object} args.conversationSelector
 * @param {Object} args.messageSelector
 * @return {Promise} find input argument object.
*/
const messageFindObject = async (
  brandId,
  integrationType,
  conversationSelector,
  messageSelector,
) => {
  /**
   * Collect integration ids
   * @param {Object} args
   * @param {Object} args.selector
  */
  const collectIntegration = async selector => {
    const integrations = await Integrations.find(selector);
    if (integrations.length < 1) {
      messageSelector.conversationId = null;
      conversationSelector.integrationId = null;
    } else {
      const integrationIds = _.pluck(integrations, '_id');
      conversationSelector.integrationId = { $in: integrationIds };
    }
  };

  if (brandId && !integrationType) {
    await collectIntegration({ brandId });
  }

  if (!brandId && integrationType) {
    await collectIntegration({ kind: integrationType });
  }

  if (brandId && integrationType) {
    await collectIntegration({ brandId, kind: integrationType });
  }

  const conversations = await Conversations.find(conversationSelector);
  if (conversations.length > 0) {
    const conversationIds = _.pluck(conversations, '_id');
    messageSelector.conversationId = { $in: conversationIds };
  }

  return messageSelector;
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
  for (let i = 0; i < loopCount; i++) {
    const divider = duration / loopCount;
    const time = startTime + divider * (i + 1);
    const dateText = moment(time).format('YYYY-MM-DD');

    const count = collection.filter(
      message => time - divider < message.createdAt && message.createdAt < time,
    ).length;

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
    const conversationSelector = { messageCount: { $ne: null } };
    const integrationSelector = {};

    if (!startDate || !endDate) {
      endDate = new Date();
      const year = moment(endDate).year();
      startDate = moment(endDate).year(year - 1);
    }

    conversationSelector.createdAt = { $gte: new Date(startDate), $lte: new Date(endDate) };
    const startTime = new Date(startDate).getTime();
    const endTime = new Date(endDate).getTime();

    if (startTime > endTime) {
      return [];
    }

    if (brandId) {
      integrationSelector.brandId = brandId;
    }

    const integrations = await Integrations.find(integrationSelector);
    const stack = {};

    // integration group of kind
    for (let detail of integrations) {
      if (!stack[detail.kind]) {
        stack[detail.kind] = [detail._id];
      } else {
        stack[detail.kind].push(detail._id);
      }
    }

    let count = 0;
    const insights = await _.keys(stack).map(async kind => {
      conversationSelector.integrationId = { $in: stack[kind] };
      count = await Conversations.find(conversationSelector).count();

      return { name: kind, value: count };
    });

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

    const messageSelector = {
      userId: volumeOrResponse,
      createdAt: { $gte: start, $lte: end },
    };

    const conversationSelector = {};
    const messageFilter = await messageFindObject(
      brandId,
      integrationType,
      conversationSelector,
      messageSelector,
    );
    const messages = await ConversationMessages.find(messageFilter);

    const punchCard = [];

    let count = 0,
      startTime = null,
      endTime = null,
      dayCount = 0;

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

    const messageSelector = { userId: volumeOrResponse };

    if (!startDate || !endDate) {
      endDate = new Date();
      const year = moment(endDate).year();
      startDate = moment(endDate).year(year - 1);
    }

    messageSelector.createdAt = { $gte: new Date(startDate), $lte: new Date(endDate) };
    const startTime = new Date(startDate).getTime();
    const endTime = new Date(endDate).getTime();

    if (startTime > endTime) {
      return [];
    }

    const duration = endTime - startTime;
    const conversationSelector = {};

    const messageFilter = await messageFindObject(
      brandId,
      integrationType,
      conversationSelector,
      messageSelector,
    );

    const messages = await ConversationMessages.find(messageFilter);

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

    const month = moment(endDate).month();
    const summaries = [
      {
        title: 'In time range',
        start: moment(startDate),
        end: moment(endDate),
      },
      {
        title: 'This month',
        start: moment(1, 'DD'),
        end: moment(),
      },
      {
        title: 'This week',
        start: moment(endDate).weekday(0),
        end: moment(endDate),
      },
      {
        title: 'Today',
        start: moment(endDate).add(-1, 'days'),
        end: moment(endDate),
      },
      {
        title: 'Last 30 days',
        start: moment(endDate).add(-30, 'days'),
        end: moment(endDate),
      },
      {
        title: 'Last month',
        start: moment(month, 'MM'),
        end: moment(month + 1, 'MM'),
      },
      {
        title: 'Last week',
        start: moment(endDate).weekday(-7),
        end: moment(endDate).weekday(0),
      },
      {
        title: 'Yesterday',
        start: moment(endDate).add(-2, 'days'),
        end: moment(endDate).add(-1, 'days'),
      },
    ];

    // finds a respective message counts for different time intervals.
    for (let summary of summaries) {
      messageFilter.createdAt = { $gt: formatTime(summary.start), $lte: formatTime(summary.end) };
      const count = await ConversationMessages.find(messageFilter).count();
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
    const messageSelector = { createdAt: { $ne: null } };

    if (!startDate || !endDate) {
      endDate = new Date();
      const year = moment(endDate).year();
      startDate = moment(endDate).year(year - 1);
    }

    const conversationSelector = { messageCount: { $gt: 2 } };
    conversationSelector.createdAt = { $gte: new Date(startDate), $lte: new Date(endDate) };
    const startTime = new Date(startDate).getTime();
    const endTime = new Date(endDate).getTime();

    if (startTime > endTime) {
      return [];
    }

    const duration = endTime - startTime;
    const messageFilter = await messageFindObject(
      brandId,
      integrationType,
      conversationSelector,
      messageSelector,
    );

    const insightData = { teamMembers: [], trend: [] };

    const firstResponseData = [],
      responseUserData = {};
    let clientMessage = {},
      userMessage = {},
      responseTime = 0,
      allResponseTime = 0;

    if (messageFilter.conversationId && messageFilter.conversationId.$in) {
      const conversationIds = messageFilter.conversationId.$in;

      // Processes total first response time for each users.
      for (let conversationId of conversationIds) {
        messageFilter.conversationId = conversationId;
        messageFilter.userId = null;
        clientMessage = await ConversationMessages.findOne(messageFilter).sort({ createdAt: 1 });
        messageFilter.userId = { $ne: null };
        userMessage = await ConversationMessages.findOne(messageFilter).sort({ createdAt: 1 });

        if (userMessage && clientMessage) {
          responseTime = getTime(userMessage.createdAt) - getTime(clientMessage.createdAt);
          responseTime = parseInt(responseTime / 1000);
          const userId = userMessage.userId;
          firstResponseData.push({
            createdAt: userMessage.createdAt,
            userId,
            responseTime,
          });

          allResponseTime = allResponseTime + responseTime;

          if (responseUserData[userId]) {
            responseTime = responseTime + responseUserData[userId].responseTime;
            const count = responseUserData[userId].count + 1;
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
    insightData.time = parseInt(allResponseTime / firstResponseData.length);

    const userIds = _.uniq(_.pluck(firstResponseData, 'userId'));

    for (let userId of userIds) {
      const user = await Users.findOne({ _id: userId });
      if (user) {
        const userMessages = firstResponseData.filter(message => userId === message.userId);
        const userDetail = user.details;
        const userData = insertData(userMessages, 5, duration, startTime);
        const data = {
          fullName: userDetail.fullName,
          avatar: userDetail.avatar,
          graph: userData,
        };
        let time = responseUserData[userId].responseTime / responseUserData[userId].count;
        time = parseInt(time);
        insightData.teamMembers.push({ data, time });
      }
    }

    return insightData;
  },
};
