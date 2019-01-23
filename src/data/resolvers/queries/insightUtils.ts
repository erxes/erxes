import * as moment from 'moment';
import * as _ from 'underscore';
import { ConversationMessages, Conversations, Integrations, Users } from '../../../db/models';
import { IMessageDocument } from '../../../db/models/definitions/conversationMessages';
import { IConversationDocument } from '../../../db/models/definitions/conversations';
import { getDateFieldAsStr } from './aggregationUtils';

interface IMessageSelector {
  userId?: string;
  createdAt?: { $gte: Date; $lte: Date };
  fromBot?: { $exists: boolean };
  conversationId?: {
    $in: string[];
  };
}

interface IGenerateChartData {
  x: any;
  y: number;
}

interface IGenerateTimeIntervals {
  title: string;
  start: any;
  end: any;
}

interface IGenerateUserChartData {
  fullName?: string;
  avatar?: string;
  graph: IGenerateChartData[];
}

interface IFixDates {
  start: Date;
  end: Date;
}

interface IResponseUserData {
  [index: string]: {
    responseTime: number;
    count: number;
    summaries?: number[];
  };
}

interface IGenerateResponseData {
  trend: IGenerateChartData[];
  time: number;
  teamMembers: {
    data: IGenerateUserChartData[];
  };
}

interface IChartData {
  collection?: any;
  messageSelector?: any;
}

export interface IListArgs {
  integrationIds: string;
  brandIds: string;
  startDate: string;
  endDate: string;
  type: string;
}

export interface IFilterSelector {
  createdAt?: { $gte: Date; $lte: Date };
  integration: {
    kind?: { $in: string[] };
    brandId?: { $in: string[] };
  };
}

/**
 * Return filterSelector
 * @param args
 */
export const getFilterSelector = (args: IListArgs): any => {
  const selector: IFilterSelector = { integration: {} };
  const { startDate, endDate, integrationIds, brandIds } = args;
  const { start, end } = fixDates(startDate, endDate);

  if (integrationIds) {
    selector.integration.kind = { $in: integrationIds.split(',') };
  }

  if (brandIds) {
    selector.integration.brandId = { $in: brandIds.split(',') };
  }

  selector.createdAt = { $gte: start, $lte: end };

  return selector;
};

/**
 * Return conversationSelect for aggregation
 * @param args
 * @param conversationSelector
 * @param selectIds
 */
export const getConversationSelector = async (args: IListArgs, conversationSelector: any): Promise<any> => {
  const filterSelector = await getFilterSelector(args);

  if (filterSelector.integration) {
    const integrationIds = await Integrations.find(filterSelector.integration).select('_id');
    conversationSelector.integrationId = { $in: integrationIds.map(row => row._id) };
  }
  conversationSelector.createdAt = filterSelector.createdAt;

  return conversationSelector;
};

/**
 * Find conversations or conversationIds.
 */
export const findConversations = async (
  filterSelector: IFilterSelector,
  conversationSelector: any,
  selectIds?: boolean,
): Promise<IConversationDocument[]> => {
  if (filterSelector.integration) {
    const integrationIds = await Integrations.find(filterSelector.integration).select('_id');
    conversationSelector.integrationId = integrationIds.map(row => row._id);
  }

  if (selectIds) {
    return Conversations.find(conversationSelector).select('_id');
  }

  return Conversations.find(conversationSelector).sort({ createdAt: 1 });
};
/**
 *
 * @param summaries
 * @param collection
 * @param selector
 */
export const getSummaryData = async ({ startDate, endDate, selector, collection }): Promise<any> => {
  const summaries: Array<{ title?: string; count?: number }> = [];
  const intervals = generateTimeIntervals(startDate, endDate);
  const facets = {};
  // finds a respective message counts for different time intervals.
  for (const interval of intervals) {
    const facetMessageSelector = { ...selector };
    facetMessageSelector.createdAt = {
      $gte: interval.start.toDate(),
      $lte: interval.end.toDate(),
    };
    facets[interval.title] = [
      {
        $match: facetMessageSelector,
      },
      {
        $group: {
          _id: null,
          count: { $sum: 1 },
        },
      },
      {
        $project: {
          _id: 0,
          count: 1,
        },
      },
    ];
  }

  const [legend] = await collection.aggregate([
    {
      $facet: facets,
    },
  ]);

  for (const interval of intervals) {
    const count = legend[interval.title][0] ? legend[interval.title][0].count : 0;
    summaries.push({
      title: interval.title,
      count,
    });
  }
  return summaries;
};

/**
 * Builds messages find query selector.
 */
export const generateMessageSelector = async (
  args: IListArgs,
  messageSelector: IMessageSelector,
): Promise<IMessageSelector> => {
  const filterSelector = await getFilterSelector(args);
  messageSelector.createdAt = filterSelector.createdAt;

  const conversationIds = await findConversations(filterSelector, { ...messageSelector }, true);
  const rawConversationIds = conversationIds.map(obj => obj._id);
  messageSelector.conversationId = { $in: rawConversationIds };

  return messageSelector;
};
/**
 * Fix trend for missing values because from then aggregation,
 * it could return missing values for some dates. This method
 * will assign 0 values for missing x values.
 * @param startDate
 * @param endDate
 * @param data
 */
export const fixChartData = async (data: any[], hintX: string, hintY: string): Promise<IGenerateChartData[]> => {
  const results = {};
  data.map(row => {
    results[row[hintX]] = row[hintY];
  });

  return Object.keys(results)
    .sort()
    .map(key => {
      return { x: formatTime(moment(key), 'MM-DD'), y: results[key] };
    });
};
/**
 * Populates message collection into date range
 * by given duration and loop count for chart data.
 */
export const generateChartData = async (args: IChartData): Promise<IGenerateChartData[]> => {
  const { collection, messageSelector } = args;

  const pipelineStages = [
    {
      $match: messageSelector,
    },
    {
      $project: {
        date: getDateFieldAsStr({}),
      },
    },
    {
      $group: {
        _id: '$date',
        y: { $sum: 1 },
      },
    },
    {
      $project: {
        x: '$_id',
        y: 1,
        _id: 0,
      },
    },
    {
      $sort: {
        x: 1,
      },
    },
  ];

  if (collection) {
    const results = {};

    collection.map(obj => {
      const date = formatTime(moment(obj.createdAt), 'YYYY-MM-DD');

      results[date] = (results[date] || 0) + 1;
    });

    return Object.keys(results)
      .sort()
      .map(key => {
        return { x: formatTime(moment(key), 'MM-DD'), y: results[key] };
      });
  }

  return ConversationMessages.aggregate([pipelineStages]);
};

/**
 * Generates time intervals for main report
 */
export const generateTimeIntervals = (start: Date, end: Date): IGenerateTimeIntervals[] => {
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

/**
 * Generate chart data for given user
 */
export const generateUserChartData = async ({
  userId,
  userMessages,
}: {
  userId: string;
  userMessages: IMessageDocument[];
}): Promise<IGenerateUserChartData> => {
  const user = await Users.findOne({ _id: userId });
  const userData = await generateChartData({ collection: userMessages });

  if (!user) {
    return {
      graph: userData,
    };
  }

  const userDetail = user.details;

  return {
    fullName: userDetail ? userDetail.fullName : '',
    avatar: userDetail ? userDetail.avatar : '',
    graph: userData,
  };
};

export const formatTime = (time, format = 'YYYY-MM-DD HH:mm:ss') => {
  return time.format(format);
};

// TODO: check usage
export const getTime = (date: string | number): number => {
  return new Date(date).getTime();
};

/*
 * Converts given value to date or if value in valid date
 * then returns default value
 */
export const fixDate = (value, defaultValue = new Date()): Date => {
  const date = new Date(value);

  if (!isNaN(date.getTime())) {
    return date;
  }

  return defaultValue;
};

export const fixDates = (startValue: string, endValue: string, count?: number): IFixDates => {
  // convert given value or get today
  const endDate = fixDate(endValue);

  const startDateDefaultValue = new Date(
    moment(endDate)
      .add(count ? count * -1 : -7, 'days')
      .toString(),
  );

  // convert given value or generate from endDate
  const startDate = fixDate(startValue, startDateDefaultValue);

  return { start: startDate, end: endDate };
};

/*
 * Determines user or client
 */
export const generateUserSelector = (type: string): any => {
  let volumeOrResponse: any = null;

  if (type === 'response') {
    volumeOrResponse = { $ne: null };
  }

  return volumeOrResponse;
};

/**
 * Generate response chart data.
 */
export const generateResponseData = async (
  responsData: IMessageDocument[],
  responseUserData: IResponseUserData,
  allResponseTime: number,
): Promise<IGenerateResponseData> => {
  // preparing trend chart data
  const trend = await generateChartData({ collection: responsData });

  // Average response time for all messages
  const time = Math.floor(allResponseTime / responsData.length);

  const teamMembers: any = [];

  const userIds = _.uniq(_.pluck(responsData, 'userId'));

  for (const userId of userIds) {
    const { responseTime, count, summaries } = responseUserData[userId];

    // Average response time for users.
    const avgResTime = Math.floor(responseTime / count);

    // preparing each team member's chart data
    teamMembers.push({
      data: await generateUserChartData({
        userId,
        userMessages: responsData.filter(message => userId === message.userId),
      }),
      time: avgResTime,
      summaries,
    });
  }

  return { trend, time, teamMembers };
};
