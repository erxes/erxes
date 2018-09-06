import * as moment from "moment";
import _ from "underscore";
import { Conversations, Integrations, Users } from "../../../db/models";

/**
 * Builds messages find query selector.
 */
export const generateMessageSelector = async (
  brandId,
  integrationType,
  conversationSelector,
  messageSelector
) => {
  const selector = messageSelector;

  const findConversationIds = async integrationSelector => {
    const integrationIds = await Integrations.find(integrationSelector).select(
      "_id"
    );
    const conversationIds = await Conversations.find({
      ...conversationSelector,
      $or: [
        {
          userId: { $exists: true },
          messageCount: { $gt: 1 }
        },
        {
          userId: { $exists: false }
        }
      ],
      integrationId: { $in: integrationIds }
    }).select("_id");

    selector.conversationId = { $in: conversationIds };
  };

  const integSelector: any = {};

  if (brandId) {
    integSelector.brandId = brandId;
  }

  if (integrationType) {
    integSelector.kind = integrationType;
  }

  await findConversationIds(integSelector);

  return selector;
};

/**
 * Populates message collection into date range
 * by given duration and loop count for chart data.
 */
export const generateChartData = (
  collection,
  loopCount,
  duration,
  startTime
) => {
  const results = [{ x: formatTime(moment(startTime), "YYYY-MM-DD"), y: 0 }];
  let begin = 0;
  let end = 0;
  let count = 0;
  let dateText = null;

  // Variable that represents time interval by steps.
  const divider = duration / loopCount;

  for (let i = 0; i < loopCount; i++) {
    end = startTime + divider * (i + 1);
    begin = end - divider;
    dateText = formatTime(moment(end), "YYYY-MM-DD");

    // messages count between begin and end time.
    count = collection.filter(
      message => begin < message.createdAt && message.createdAt < end
    ).length;

    results.push({ x: dateText, y: count });
  }

  return results;
};

/**
 * Generates time intervals for main report
 */
export const generateTimeIntervals = (start, end) => {
  const month = moment(end).month();

  return [
    {
      title: "In time range",
      start: moment(start),
      end: moment(end)
    },
    {
      title: "This month",
      start: moment(1, "DD"),
      end: moment()
    },
    {
      title: "This week",
      start: moment(end).weekday(0),
      end: moment(end)
    },
    {
      title: "Today",
      start: moment(end).add(-1, "days"),
      end: moment(end)
    },
    {
      title: "Last 30 days",
      start: moment(end).add(-30, "days"),
      end: moment(end)
    },
    {
      title: "Last month",
      start: moment(month + 1, "MM").subtract(1, "months"),
      end: moment(month + 1, "MM")
    },
    {
      title: "Last week",
      start: moment(end).weekday(-7),
      end: moment(end).weekday(0)
    },
    {
      title: "Yesterday",
      start: moment(end).add(-2, "days"),
      end: moment(end).add(-1, "days")
    }
  ];
};

/**
 * Generate chart data for given user
 */
export const generateUserChartData = async ({
  userId,
  userMessages,
  duration,
  startTime
}) => {
  const user = await Users.findOne({ _id: userId });
  const userData = generateChartData(userMessages, 4, duration, startTime);

  if (!user) {
    return {
      graph: userData
    };
  }

  const userDetail = user.details;

  return {
    fullName: userDetail.fullName,
    avatar: userDetail.avatar,
    graph: userData
  };
};

export const formatTime = (time, format = "YYYY-MM-DD HH:mm:ss") => {
  return time.format(format);
};

// TODO: check usage
export const getTime = (date: string | number) => {
  return new Date(date).getTime();
};

/*
 * Converts given value to date or if value in valid date
 * then returns default value
 */
export const fixDate = (value, defaultValue = new Date()) => {
  const date = new Date(value);

  if (!isNaN(date.getTime())) {
    return date;
  }

  return defaultValue;
};

export const fixDates = (startValue, endValue) => {
  // convert given value or get today
  const endDate = fixDate(endValue);

  const startDateDefaultValue = new Date(
    moment(endDate)
      .add(-7, "days")
      .toString()
  );

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
    duration: endTime - startTime
  };
};

/* 
 * Determines user or client
 */
export const generateUserSelector = type => {
  let volumeOrResponse = null;

  if (type === "response") {
    volumeOrResponse = { $ne: null };
  }

  return volumeOrResponse;
};

/**
 * Generate response chart data.
 */
export const generateResponseData = async (
  responsData,
  responseUserData,
  allResponseTime: number,
  duration,
  startTime
) => {
  // preparing trend chart data
  const trend = generateChartData(responsData, 7, duration, startTime);

  // Average response time for all messages
  const time = allResponseTime / responsData.length;

  const teamMembers = [];

  const userIds = _.uniq(_.pluck(responsData, "userId"));

  for (const userId of userIds) {
    // Average response time for users.
    const avgResTime =
      responseUserData[userId].responseTime / responseUserData[userId].count;

    // preparing each team member's chart data
    teamMembers.push({
      data: await generateUserChartData({
        userId,
        userMessages: responsData.filter(message => userId === message.userId),
        duration,
        startTime
      }),

      time: avgResTime
    });
  }

  return { trend, time, teamMembers };
};
