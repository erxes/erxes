import { Meteor } from 'meteor/meteor';
import { check, Match } from 'meteor/check';
import { _ } from 'meteor/underscore';
import moment from 'moment';

import { Integrations } from '/imports/api/integrations/integrations';
import { Conversations } from '/imports/api/conversations/conversations';
import { Messages } from '/imports/api/conversations/messages';

Meteor.publishComposite('insights.integration', function Circle(params) {
  check(params, {
    startDate: Match.Optional(String),
    endDate: Match.Optional(String),
    brandId: Match.Optional(String),
  });

  if (!this.userId) {
    return {
      find() {
        this.ready();
      },
    };
  }

  const { brandId } = params;
  let { startDate, endDate } = params;

  const conversationSelector = { messageCount: { $ne: null } };
  const integrationSelector = {};

  if (!startDate || !endDate) {
    const fullDate = new Date();
    const year = fullDate.getFullYear();
    const month = fullDate.getMonth();
    const date = fullDate.getDate();

    startDate = `${year - 1}/${month - 1}/${date}`;
    endDate = `${year}/${month + 1}/${date}`;
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

  const integrations = Integrations.find(integrationSelector);
  const stack = {};

  integrations.forEach(detail => {
    // Хэрвээ бараа өмнө группд ороогүй бол
    if (!stack[detail.kind]) {
      stack[detail.kind] = [detail._id];
    } else {
      stack[detail.kind].push(detail._id);
    }
  });

  _.each(_.keys(stack), kind => {
    conversationSelector.integrationId = { $in: stack[kind] };
    const count = Conversations.find(conversationSelector).count();
    const data = { name: kind, value: count };
    this.added('integration', kind, data);
  });

  return {
    find() {
      return this.ready();
    },
  };
});

Meteor.publishComposite('insights.teamMembers', function teamMembers(params) {
  check(params, {
    startDate: Match.Optional(String),
    endDate: Match.Optional(String),
    integrationType: Match.Optional(String),
    brandId: Match.Optional(String),
  });

  if (!this.userId) {
    return {
      find() {
        this.ready();
      },
    };
  }

  const { brandId, integrationType } = params;
  let { startDate, endDate } = params;

  const messageSelector = { userId: { $ne: null } };

  if (!startDate || !endDate) {
    const fullDate = new Date();
    const year = fullDate.getFullYear();
    const month = fullDate.getMonth();
    const date = fullDate.getDate();

    startDate = `${year - 1}/${month - 1}/${date}`;
    endDate = `${year}/${month + 1}/${date}`;
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

  let conversationSelector = {};

  const collectConversation = selector => {
    const integrations = Integrations.find(selector);
    const integrationIds = _.pluck(integrations.fetch(), '_id');
    if (integrationIds.length > 0) {
      conversationSelector = { integrationId: { $in: integrationIds } };
    }
  };

  if (brandId && !integrationType) {
    collectConversation({ brandId });
  }

  if (!brandId && integrationType) {
    collectConversation({ kind: integrationType });
  }

  if (brandId && integrationType) {
    collectConversation({ brandId, kind: integrationType });
  }

  if (conversationSelector.integrationId) {
    const conversations = Conversations.find(conversationSelector);
    const conversationIds = _.pluck(conversations.fetch(), '_id');
    messageSelector.conversationId = { $in: conversationIds };
  }

  const messages = Messages.find(messageSelector).fetch();

  const insertData = (collection, loopCount) => {
    const results = [];
    for (let i = 0; i < loopCount; i++) {
      const divider = duration / loopCount * (i + 1);
      const time = startTime + divider;
      const dateText = moment(time).format('YYYY-MM-DD');

      const count = collection.filter(
        message => time - divider < message.createdAt && message.createdAt < time,
      ).length;

      results.push({ name: dateText, count });
    }
    return results;
  };

  const userIds = [];
  messages.forEach(message => {
    const registered = userIds.filter(userId => userId === message.userId).length;
    if (registered === 0) {
      userIds.push(message.userId);
    }
  });

  const mainData = insertData(messages, 10);
  mainData.forEach((data, index) => {
    this.added('main_graph', index, data);
  });

  userIds.forEach((userId, index) => {
    const userMessages = messages.filter(message => userId === message.userId);
    const user = Meteor.users.findOne(userId);
    if (user) {
      const userDetails = user.details;
      const userData = insertData(userMessages, 5);
      const data = { fullName: userDetails.fullName, avatar: userDetails.avatar, data: userData };
      this.added('users_data', index, data);
    }
  });

  return {
    find() {
      return this.ready();
    },
  };
});
