import { Users, Integrations, Conversations } from '../../../db/models';
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
export const generateMessageSelector = async (
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
      $or: [
        {
          userId: { $exists: true },
          messageCount: { $gt: 1 },
        },
        {
          userId: { $exists: false },
        },
      ],
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
export const generateChartData = (collection, loopCount, duration, startTime) => {
  const results = [{ x: formatTime(moment(startTime), 'YYYY-MM-DD'), y: 0 }];
  let begin = 0;
  let end = 0;
  let count = 0;
  let dateText = null;

  // Variable that represents time interval by steps.
  const divider = duration / loopCount;

  for (let i = 0; i < loopCount; i++) {
    end = startTime + divider * (i + 1);
    begin = end - divider;
    dateText = formatTime(moment(end), 'YYYY-MM-DD');

    // messages count between begin and end time.
    count = collection.filter(message => begin < message.createdAt && message.createdAt < end)
      .length;

    results.push({ x: dateText, y: count });
  }

  return results;
};

/**
 * Generates time intervals for main report
 * @param {Date} start
 * @param {Date} end
 * @return {Array} time intervals
 */
export const generateTimeIntervals = (start, end) => {
  const month = moment(end).month();

  return [
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
      start: moment(month + 1, 'MM').subtract(1, 'months'),
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
};

/* Generate chart data for given user
 * @param {String} userId
 * @param {[Message]} userMessages
 * @param {Number} duration
 * @param {Number} startTime
 * @return {Object} user detail informations with chart data
 */
export const generateUserChartData = async ({ userId, userMessages, duration, startTime }) => {
  const user = await Users.findOne({ _id: userId });
  const userData = generateChartData(userMessages, 4, duration, startTime);

  if (!user) {
    return {
      graph: userData,
    };
  }

  const userDetail = user.details;

  return {
    fullName: userDetail.fullName,
    avatar: userDetail.avatar,
    graph: userData,
  };
};

export const formatTime = (time, format = 'YYYY-MM-DD HH:mm:ss') => {
  return time.format(format);
};

export const getTime = time => {
  return new Date(time).getTime();
};

/*
 * Converts given value to date or if value in valid date
 * then returns default value
 */
export const fixDate = (value, defaultValue = new Date()) => {
  var date = new Date(value);

  if (!isNaN(date.getTime())) {
    return date;
  }

  return defaultValue;
};

export const fixDates = (startValue, endValue) => {
  // convert given value or get today
  const endDate = fixDate(endValue);

  const startDateDefaultValue = moment(endDate).add(-7, 'days');

  // convert given value or generate from endDate
  const startDate = fixDate(startValue, startDateDefaultValue);

  return { start: startDate, end: endDate };
};

export const generateDuration = ({ start, end }) => {
  const startTime = getTime(start);
  const endTime = getTime(end);

  return {
    startTime,
    endTime,
    duration: endTime - startTime,
  };
};

/* Determines user or client
 * @param {String} type
 * @return {Object} user selector
 */
export const generateUserSelector = type => {
  let volumeOrResponse = null;

  if (type === 'response') {
    volumeOrResponse = { $ne: null };
  }

  return volumeOrResponse;
};

/**
 * Generate response chart data.
 * @param {Object} args
 * @param {[Object]} args.responsData
 * @param {[Object]} args.responseUserData
 * @param {Integer} args.allResponseTime
 * @param {Integer} args.duration
 * @param {Integer} args.starTime
 * @return {Object} Data { trend: [Object], teamMembers: [Object], time: Integer }
 */
export const generateResponseData = async (
  responsData,
  responseUserData,
  allResponseTime,
  duration,
  startTime,
) => {
  // preparing trend chart data
  const trend = generateChartData(responsData, 7, duration, startTime);

  // Average response time for all messages
  const time = parseInt(allResponseTime / responsData.length);

  const teamMembers = [];

  const userIds = _.uniq(_.pluck(responsData, 'userId'));

  for (let userId of userIds) {
    // Average response time for users.
    let time = responseUserData[userId].responseTime / responseUserData[userId].count;

    // preparing each team member's chart data
    teamMembers.push({
      data: await generateUserChartData({
        userId,
        userMessages: responsData.filter(message => userId === message.userId),
        duration,
        startTime,
      }),

      time: parseInt(time),
    });
  }

  return { trend, time, teamMembers };
};
