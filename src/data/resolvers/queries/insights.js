import { Integrations, Conversations, ConversationMessages, Users } from '../../../db/models';
import moment from 'moment';
import _ from 'underscore';

const conversationFilter = async (
  brandId,
  integrationType,
  conversationSelector,
  messageSelector,
) => {
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
    const messageFilter = await conversationFilter(
      brandId,
      integrationType,
      conversationSelector,
      messageSelector,
    );
    const messages = await ConversationMessages.find(messageFilter);

    const punchCard = [];
    let count = 0;
    for (let i = 0; i < 7 * 24; i++) {
      const startTime = moment(start).add(i, 'hours');
      const endTime = moment(start).add(i + 1, 'hours');

      count = messages.filter(
        message => startTime < message.createdAt && message.createdAt < endTime,
      ).length;

      const dayCount = startTime.weekday();

      if (count > 0) {
        punchCard.push([dayCount, i % 24, count]);
      }
    }

    return punchCard;
  },

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

    const messageFilter = await conversationFilter(
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

      for (let userId of userIds) {
        const user = await Users.findOne({ _id: userId });
        if (user) {
          const userMessages = messages.filter(message => userId === message.userId);
          const userDetail = user.details;
          const userData = insertData(userMessages, 5, duration, startTime);
          const data = {
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

    for (let summary of summaries) {
      messageFilter.createdAt = { $gt: formatTime(summary.start), $lte: formatTime(summary.end) };
      const count = await ConversationMessages.find(messageFilter).count();
      const data = { title: summary.title, count };
      insightData.summary.push(data);
    }

    return insightData;
  },

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
    const messageFilter = await conversationFilter(
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

    if (messageFilter.conversationId.$in) {
      const conversationIds = messageFilter.conversationId.$in;

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
