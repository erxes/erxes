import * as moment from 'moment';
import * as _ from 'underscore';
import {
  ConversationMessages,
  Conversations,
  Deals,
  Integrations,
  Pipelines,
  Stages,
  Users
} from '../../../db/models';
import { IStageDocument } from '../../../db/models/definitions/boards';
import { CONVERSATION_STATUSES } from '../../../db/models/definitions/constants';
import { IMessageDocument } from '../../../db/models/definitions/conversationMessages';
import { IUser } from '../../../db/models/definitions/users';
import { INSIGHT_TYPES } from '../../constants';
import { fixDate } from '../../utils';
import { getDateFieldAsStr } from './aggregationUtils';
import {
  IDealListArgs,
  IDealSelector,
  IFilterSelector,
  IFixDates,
  IGenerateChartData,
  IGenerateMessage,
  IGeneratePunchCard,
  IGenerateResponseData,
  IGenerateTimeIntervals,
  IGenerateUserChartData,
  IListArgs,
  IMessageSelector,
  IResponseUserData,
  IStageSelector
} from './types';

/**
 * Return filterSelector
 * @param args
 */
export const getFilterSelector = (args: IListArgs): { [key: string]: any } => {
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
 * Return filterSelector
 * @param args
 */
export const getDealSelector = async (
  args: IDealListArgs
): Promise<IDealSelector> => {
  const { startDate, endDate, boardId, pipelineIds, status } = args;
  const { start, end } = fixDates(startDate, endDate);

  const selector: IDealSelector = {};
  const date = {
    $gte: start,
    $lte: end
  };

  // If status is either won or lost, modified date is more important
  if (status) {
    selector.modifiedAt = date;
  } else {
    selector.createdAt = date;
  }

  const stageSelector: IStageSelector = {};

  if (status) {
    stageSelector.probability = status;
  }

  let stages: IStageDocument[] = [];

  if (boardId) {
    if (pipelineIds) {
      stageSelector.pipelineId = { $in: pipelineIds.split(',') };
    } else {
      const pipelines = await Pipelines.find({ boardId });
      stageSelector.pipelineId = { $in: pipelines.map(p => p._id) };
    }

    stages = await Stages.find(stageSelector);
    selector.stageId = { $in: stages.map(s => s._id) };
  } else {
    if (status) {
      stages = await Stages.find(stageSelector);
      selector.stageId = { $in: stages.map(s => s._id) };
    }
  }

  return selector;
};

/**
 * Return conversationSelect for aggregation
 * @param args
 * @param conversationSelector
 * @param selectIds
 */
export const getConversationSelector = async (
  filterSelector: any,
  conversationSelector: any = {},
  fieldName: string = 'createdAt'
): Promise<any> => {
  if (Object.keys(filterSelector.integration).length > 0) {
    const integrationIds = await Integrations.findIntegrations(
      filterSelector.integration
    ).select('_id');
    conversationSelector.integrationId = {
      $in: integrationIds.map(row => row._id)
    };
  }

  if (!conversationSelector[fieldName]) {
    conversationSelector[fieldName] = filterSelector.createdAt;
  }

  return { ...conversationSelector, ...noConversationSelector };
};
/**
 *
 * @param summaries
 * @param collection
 * @param selector
 */
export const getSummaryData = async ({
  start,
  end,
  selector,
  collection,
  dateFieldName = 'createdAt'
}: {
  start: Date;
  end: Date;
  selector: any;
  collection: any;
  dateFieldName?: string;
}): Promise<any> => {
  const intervals = generateTimeIntervals(start, end);
  const summaries: Array<{ title?: string; count?: number }> = [];

  // finds a respective message counts for different time intervals.
  for (const interval of intervals) {
    const facetMessageSelector = { ...selector };

    facetMessageSelector[dateFieldName] = {
      $gte: interval.start.toDate(),
      $lte: interval.end.toDate()
    };
    const [intervalCount] = await collection.aggregate([
      {
        $match: facetMessageSelector
      },
      {
        $group: {
          _id: null,
          count: { $sum: 1 }
        }
      },
      {
        $project: {
          _id: 0,
          count: 1
        }
      }
    ]);

    summaries.push({
      title: interval.title,
      count: intervalCount ? intervalCount.count : 0
    });
  }

  return summaries;
};

/**
 * Builds messages find query selector.
 */
export const getMessageSelector = async ({
  args,
  createdAt
}: IGenerateMessage): Promise<IMessageSelector> => {
  const messageSelector: any = {
    fromBot: { $exists: false },
    userId: args.type === 'response' ? { $ne: null } : null
  };

  const filterSelector = getFilterSelector(args);
  messageSelector.createdAt = filterSelector.createdAt;

  // While searching by integration
  if (Object.keys(filterSelector.integration).length > 0) {
    const selector = await getConversationSelector(filterSelector, {
      createdAt
    });

    const conversationIds = await Conversations.find(selector).select('_id');

    const rawConversationIds = conversationIds.map(obj => obj._id);
    messageSelector.conversationId = { $in: rawConversationIds };
  }

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
export const fixChartData = async (
  data: any[],
  hintX: string,
  hintY: string
): Promise<IGenerateChartData[]> => {
  const results = {};
  data.map(row => {
    results[row[hintX]] = row[hintY];
  });

  return Object.keys(results)
    .sort()
    .map(key => {
      return { x: moment(key).format('MM-DD'), y: results[key] };
    });
};

/**
 * Populates message collection into date range
 * by given duration and loop count for chart data.
 */
export const generateChartDataBySelector = async ({
  selector,
  type = INSIGHT_TYPES.CONVERSATION,
  dateFieldName = '$createdAt'
}: {
  selector: IMessageSelector;
  type?: string;
  dateFieldName?: string;
}): Promise<IGenerateChartData[]> => {
  const pipelineStages = [
    {
      $match: selector
    },
    {
      $project: {
        date: getDateFieldAsStr({ fieldName: dateFieldName })
      }
    },
    {
      $group: {
        _id: '$date',
        y: { $sum: 1 }
      }
    },
    {
      $project: {
        x: '$_id',
        y: 1,
        _id: 0
      }
    },
    {
      $sort: {
        x: 1
      }
    }
  ];

  if (type === INSIGHT_TYPES.DEAL) {
    return Deals.aggregate([pipelineStages]);
  }

  return ConversationMessages.aggregate([pipelineStages]);
};

export const generatePunchData = async (
  collection: any,
  selector: object,
  user: IUser
): Promise<IGeneratePunchCard> => {
  const pipelineStages = [
    {
      $match: selector
    },
    {
      $project: {
        hour: { $hour: { date: '$createdAt', timezone: '+08' } },
        date: await getDateFieldAsStr({ timeZone: getTimezone(user) })
      }
    },
    {
      $group: {
        _id: {
          hour: '$hour',
          date: '$date'
        },
        count: { $sum: 1 }
      }
    },
    {
      $project: {
        _id: 0,
        hour: '$_id.hour',
        date: '$_id.date',
        count: 1
      }
    }
  ];

  return collection.aggregate(pipelineStages);
};

/**
 * Populates message collection into date range
 * by given duration and loop count for chart data.
 */

export const generateChartDataByCollection = async (
  collection: any
): Promise<IGenerateChartData[]> => {
  const results = {};

  collection.map(obj => {
    const date = moment(obj.createdAt).format('YYYY-MM-DD');

    results[date] = (results[date] || 0) + 1;
  });

  return Object.keys(results)
    .sort()
    .map(key => {
      return { x: moment(key).format('MM-DD'), y: results[key] };
    });
};

/**
 * Generates time intervals for main report
 */
export const generateTimeIntervals = (
  start: Date,
  end: Date
): IGenerateTimeIntervals[] => {
  const month = moment(end).month();

  return [
    {
      title: 'In time range',
      start: moment(start),
      end: moment(end)
    },
    {
      title: 'This month',
      start: moment(1, 'DD'),
      end: moment()
    },
    {
      title: 'This week',
      start: moment(end).weekday(0),
      end: moment(end)
    },
    {
      title: 'Today',
      start: moment(end).add(-1, 'days'),
      end: moment(end)
    },
    {
      title: 'Last 30 days',
      start: moment(end).add(-30, 'days'),
      end: moment(end)
    },
    {
      title: 'Last month',
      start: moment(month + 1, 'MM').subtract(1, 'months'),
      end: moment(month + 1, 'MM')
    },
    {
      title: 'Last week',
      start: moment(end).weekday(-7),
      end: moment(end).weekday(0)
    },
    {
      title: 'Yesterday',
      start: moment(end).add(-2, 'days'),
      end: moment(end).add(-1, 'days')
    }
  ];
};

/**
 * Generate chart data for given user
 */
export const generateUserChartData = async ({
  userId,
  userMessages
}: {
  userId: string;
  userMessages: IMessageDocument[];
}): Promise<IGenerateUserChartData> => {
  const user = await Users.findOne({ _id: userId });
  const userData = await generateChartDataByCollection(userMessages);

  if (!user) {
    return {
      graph: userData
    };
  }

  const userDetail = user.details;

  return {
    fullName: userDetail ? userDetail.fullName : '',
    avatar: userDetail ? userDetail.avatar : '',
    graph: userData
  };
};

export const fixDates = (
  startValue: string,
  endValue: string,
  count?: number
): IFixDates => {
  // convert given value or get today
  const endDate = fixDate(endValue);

  const startDateDefaultValue = new Date(
    moment(endDate)
      .add(count ? count * -1 : -7, 'days')
      .toString()
  );

  // convert given value or generate from endDate
  const startDate = fixDate(startValue, startDateDefaultValue);

  return { start: startDate, end: endDate };
};

export const getSummaryDates = (endValue: string): any => {
  // convert given value or get today
  const endDate = fixDate(endValue);

  const month = moment(endDate).month();
  const startDate = new Date(
    moment(month + 1, 'MM')
      .subtract(1, 'months')
      .toString()
  );

  return { $gte: startDate, $lte: endDate };
};

/**
 * Generate response chart data.
 */
export const generateResponseData = async (
  responseData: IMessageDocument[],
  responseUserData: IResponseUserData,
  allResponseTime: number
): Promise<IGenerateResponseData> => {
  // preparing trend chart data
  const trend = await generateChartDataByCollection(responseData);

  // Average response time for all messages
  const time = Math.floor(allResponseTime / responseData.length);

  const teamMembers: any = [];

  const userIds = _.uniq(_.pluck(responseData, 'userId')) as string[];

  for (const userId of userIds) {
    const { responseTime, count, summaries } = responseUserData[userId || ''];

    // Average response time for users.
    const avgResTime = Math.floor(responseTime / count);

    // preparing each team member's chart data
    teamMembers.push({
      data: await generateUserChartData({
        userId: userId || '',
        userMessages: responseData.filter(message => userId === message.userId)
      }),
      time: avgResTime,
      summaries
    });
  }

  return { trend, time, teamMembers };
};

export const getTimezone = (user: IUser): string => {
  return (user.details ? user.details.location : '+08') || '+08';
};

export const noConversationSelector = {
  $or: [
    { userId: { $exists: true }, messageCount: { $gt: 1 } },
    {
      userId: { $exists: false },
      $or: [
        {
          closedAt: { $exists: true },
          closedUserId: { $exists: true },
          status: CONVERSATION_STATUSES.CLOSED
        },
        {
          status: { $ne: CONVERSATION_STATUSES.CLOSED }
        }
      ]
    }
  ]
};

export const timeIntervals: any[] = [
  { name: '0-5 second', count: 5 },
  { name: '6-10 second', count: 10 },
  { name: '11-15 second', count: 15 },
  { name: '16-20 second', count: 20 },
  { name: '21-25 second', count: 25 },
  { name: '26-30 second', count: 30 },
  { name: '31-35 second', count: 35 },
  { name: '36-40 second', count: 40 },
  { name: '41-45 second', count: 45 },
  { name: '46-50 second', count: 50 },
  { name: '51-55 second', count: 55 },
  { name: '56-60 second', count: 60 },
  { name: '1-2 min', count: 120 },
  { name: '2-3 min', count: 180 },
  { name: '3-4 min', count: 240 },
  { name: '4-5 min', count: 300 },
  { name: '5+ min' }
];

export const timeIntervalBranches = () => {
  const copyTimeIntervals = [...timeIntervals];
  copyTimeIntervals.pop();

  return copyTimeIntervals.map(t => ({
    case: { $lte: ['$firstRespondTime', t.count] },
    then: t.name
  }));
};

/**
 * Return conversationSelect for aggregation
 * @param filterSelector
 * @param conversationSelector
 * @param messageSelector
 */
export const getConversationSelectorToMsg = async (
  integrationIds: string,
  brandIds: string,
  conversationSelector: any = {}
): Promise<any> => {
  const filterSelector: IFilterSelector = { integration: {} };
  if (integrationIds) {
    filterSelector.integration.kind = { $in: integrationIds.split(',') };
  }

  if (brandIds) {
    filterSelector.integration.brandId = { $in: brandIds.split(',') };
  }

  if (Object.keys(filterSelector.integration).length > 0) {
    const integrationIdsList = await Integrations.findIntegrations(
      filterSelector.integration
    ).select('_id');
    conversationSelector.integrationId = {
      $in: integrationIdsList.map(row => row._id)
    };
  }
  return { ...conversationSelector };
};

export const getConversationSelectorByMsg = async (
  integrationIds: string,
  brandIds: string,
  conversationSelector: any = {},
  messageSelector: any = {}
): Promise<any> => {
  const conversationFinder = await getConversationSelectorToMsg(
    integrationIds,
    brandIds,
    conversationSelector
  );
  const conversationIds = await Conversations.find(conversationFinder).select(
    '_id'
  );

  const rawConversationIds = await conversationIds.map(obj => obj._id);
  messageSelector.conversationId = { $in: rawConversationIds };

  return { ...messageSelector };
};

export const getConversationReportLookup = async (): Promise<any> => {
  return {
    lookupPrevMsg: {
      $lookup: {
        from: 'conversation_messages',
        let: { checkConversation: '$conversationId', checkAt: '$createdAt' },
        pipeline: [
          {
            $match: {
              $expr: {
                $and: [
                  { $eq: ['$conversationId', '$$checkConversation'] },
                  { $lt: ['$createdAt', '$$checkAt'] }
                ]
              }
            }
          },
          {
            $project: {
              conversationId: 1,
              createdAt: 1,
              internal: 1,
              userId: 1,
              customerId: 1,
              sizeMentionedIds: { $size: '$mentionedUserIds' }
            }
          }
        ],
        as: 'prevMsgs'
      }
    },
    prevMsgSlice: {
      $addFields: { prevMsg: { $slice: ['$prevMsgs', -1] } }
    },
    diffSecondCalc: {
      $addFields: {
        diffSec: {
          $divide: [{ $subtract: ['$createdAt', '$prevMsg.createdAt'] }, 1000]
        }
      }
    },
    firstProject: {
      $project: {
        conversationId: 1,
        createdAt: 1,
        internal: 1,
        userId: 1,
        customerId: 1,
        prevMsg: 1
      }
    }
  };
};
