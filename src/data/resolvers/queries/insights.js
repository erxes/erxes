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

    if (integrations.count() < 1) {
      messageSelector.conversationId = 'notfoundconv';
      return messageSelector;
    }

    const integrationIds = _.pluck(integrations, '_id');
    if (integrationIds.length > 0) {
      conversationSelector.integrationId = { $in: integrationIds };
    }
  };

  if (brandId && !integrationType) {
    collectIntegration({ brandId });
  }

  if (!brandId && integrationType) {
    collectIntegration({ kind: integrationType });
  }

  if (brandId && integrationType) {
    collectIntegration({ brandId, kind: integrationType });
  }

  const conv = conversationSelector;
  if (conv.integrationId || conv.createdAt) {
    const conversations = await Conversations.find(conv);
    const conversationIds = _.pluck(conversations, '_id');
    messageSelector.conversationId = { $in: conversationIds };
  }

  return messageSelector;
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
      return {
        find() {
          this.ready();
        },
      };
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
      return {
        find() {
          this.ready();
        },
      };
    }

    const duration = endTime - startTime;
    const conversationSelector = {};

    const messageFilter = conversationFilter(
      brandId,
      integrationType,
      conversationSelector,
      messageSelector,
    );
    const messages = await ConversationMessages.find(messageFilter);

    const insertData = (collection, loopCount) => {
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

    const mainData = insertData(messages, 10);
    const allData = {};
    allData.trend = await mainData.map(data => {
      return data;
    });

    if (type === 'response') {
      const userIds = {};

      messages.map(message => {
        const userId = message.userId;
        if (userId) {
          if (!userIds[userId]) {
            userIds[userId] = { count: 0, userId };
          }

          const count = userIds[userId].count + 1;
          userIds[userId] = { count, userId };
        }
      });

      const sortedIds = _.sortBy(userIds, item => item.count).reverse();

      allData.teamMembers = await sortedIds.map(async val => {
        const userId = val.userId;
        const user = await Users.findOne({ _id: userId });
        if (user) {
          const userMessages = messages.filter(message => userId === message.userId);
          const userDetail = user.details;
          const userData = insertData(userMessages, 5);
          const data = { fullName: userDetail.fullName, avatar: userDetail.avatar, data: userData };
          return data;
        }
      });
    }

    const month = moment(endDate).month();
    const summaries = [
      {
        title: 'In time range',
        start: startDate,
        end: endDate,
      },
      {
        title: 'This month',
        start: moment(1, 'DD'),
        end: moment(),
      },
      {
        title: 'This week',
        start: moment(endDate).weekday(0),
        end: endDate,
      },
      {
        title: 'Today',
        start: moment(endDate).add(-1, 'days'),
        end: endDate,
      },
      {
        title: 'Last 30 days',
        start: moment(endDate).add(-30, 'days'),
        end: endDate,
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

    allData.summary = await summaries.map(summary => {
      const start = new Date(summary.start).getTime();
      const end = new Date(summary.end).getTime();

      const count = messages.filter(message => start < message.createdAt && message.createdAt < end)
        .length;

      const data = { name: summary.title, count };
      return data;
    });

    return allData;
  },

  async insightsPunchCard(root, { type, integrationType, brandId, endDate }) {
    let volumeOrResponse = null;

    if (type === 'response') {
      volumeOrResponse = { $ne: null };
    }

    const messageSelector = { userId: volumeOrResponse };

    if (!endDate) {
      endDate = new Date();
    }

    const end = moment(endDate).format('YYYY-MM-DD');
    const start = moment(end).add(-7, 'days');

    messageSelector.createdAt = { $gte: new Date(start), $lte: new Date(end) };

    const conversationSelector = {};
    const messageFilter = conversationFilter(
      brandId,
      integrationType,
      conversationSelector,
      messageSelector,
    );
    const messages = await ConversationMessages.find(messageFilter);

    const stack = {};

    for (let i = 0; i < 7 * 24; i++) {
      const startTime = moment(start).add(i, 'hours');
      const endTime = moment(start).add(i + 1, 'hours');

      const count = messages.filter(
        message => startTime < message.createdAt && message.createdAt < endTime,
      ).length;

      const dayCount = startTime.weekday();

      if (!stack[dayCount]) {
        stack[dayCount] = [count];
      } else {
        stack[dayCount].push(count);
      }
    }

    const punchCard = await _.keys(stack).map(kind => {
      return { day: kind, value: stack[kind] };
    });

    return punchCard;
  },

  async insightsFirstResponse(root, { integrationType, brandId, startDate, endDate }) {
    const messageSelector = { userId: { $ne: null } };

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
      return {
        find() {
          this.ready();
        },
      };
    }

    const duration = endTime - startTime;
    const messageFilter = conversationFilter(
      brandId,
      integrationType,
      conversationSelector,
      messageSelector,
    );
    const messages = await ConversationMessages.find(messageFilter);

    const insertData = (collection, loopCount) => {
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

    const mainData = insertData(messages, 10);
    const allData = {};
    allData.trend = await mainData.map(data => {
      return data;
    });

    const userIds = {};

    messages.forEach(message => {
      const userId = message.userId;
      if (userId) {
        if (!userIds[userId]) {
          userIds[userId] = { count: 0, userId };
        }

        const count = userIds[userId].count + 1;
        userIds[userId] = { count, userId };
      }
    });

    const sortedIds = _.sortBy(userIds, item => item.count).reverse();
    allData.teamMembers = await sortedIds.map(async val => {
      const userId = val.userId;
      const user = await Users.findOne(userId);
      if (user) {
        const userMessages = messages.filter(message => userId === message.userId);
        const userDetails = user.details;
        const userData = insertData(userMessages, 5);
        const data = { fullName: userDetails.fullName, avatar: userDetails.avatar, data: userData };
        return data;
      }
    });

    return allData;
  },
};
