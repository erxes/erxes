import * as moment from 'moment';
import {
  ConversationMessages,
  Conversations,
  Integrations,
  Tags
} from '../../../db/models';
import { TAG_TYPES } from '../../../db/models/definitions/constants';
import { IUserDocument } from '../../../db/models/definitions/users';
import { getDateFieldAsStr, getDurationField } from './aggregationUtils';
import { convertTime, fixNumber, nextTime } from './exportUtils';
import {
  IListArgs,
  IListArgsWithUserId,
  IVolumeReportExportArgs
} from './types';
import {
  fixDates,
  getConversationSelector,
  getFilterSelector,
  getMessageSelector,
  getTimezone,
  noConversationSelector,
  timeIntervalBranches
} from './utils';

export const generateVolumeReport = async (
  args: IListArgs,
  user: IUserDocument
) => {
  const { startDate, endDate, type } = args;

  let diffCount = 7;
  let timeFormat = 'YYYY-MM-DD';
  let aggregationTimeFormat = '%Y-%m-%d';

  if (type === 'volumeByTime') {
    diffCount = 1;
    timeFormat = 'YYYY-MM-DD HH';
    aggregationTimeFormat = '%Y-%m-%d %H';
  }

  const filterSelector = await getFilterSelector(args);

  const conversationSelector = await getConversationSelector(filterSelector);

  const aggregatedData = await Conversations.aggregate([
    {
      $match: conversationSelector
    },
    {
      $project: {
        date: await getDateFieldAsStr({
          timeFormat: aggregationTimeFormat,
          timeZone: getTimezone(user)
        }),
        customerId: 1,
        status: 1,
        closeTime: getDurationField({
          startField: '$closedAt',
          endField: '$createdAt'
        }),
        firstRespondTime: getDurationField({
          startField: '$firstRespondedDate',
          endField: '$createdAt'
        })
      }
    },
    {
      $group: {
        _id: '$date',
        uniqueCustomerIds: { $addToSet: '$customerId' },
        totalCount: { $sum: 1 },
        totalResponseTime: { $sum: '$firstRespondTime' },
        totalCloseTime: { $sum: '$closeTime' }
      }
    },
    {
      $project: {
        uniqueCustomerCount: { $size: '$uniqueCustomerIds' },
        totalCount: 1,
        totalCloseTime: 1,
        totalResponseTime: 1,
        percentage: {
          $multiply: [
            {
              $divide: [{ $size: '$uniqueCustomerIds' }, '$totalCount']
            },
            100
          ]
        }
      }
    }
  ]);

  const resolvedSelector = await getConversationSelector(
    filterSelector,
    { status: 'closed' },
    'closedAt'
  );

  const resolvedAggregatedData = await Conversations.aggregate([
    {
      $match: resolvedSelector
    },
    {
      $project: {
        date: await getDateFieldAsStr({
          fieldName: '$closedAt',
          timeFormat: aggregationTimeFormat,
          timeZone: getTimezone(user)
        })
      }
    },
    {
      $group: {
        _id: '$date',
        resolvedCount: { $sum: 1 }
      }
    }
  ]);

  let totalCustomerCount = 0;
  let totalUniqueCount = 0;
  let totalConversationMessages = 0;
  let totalResolved = 0;

  let averageResponseDuration = 0;
  let firstResponseDuration = 0;
  let totalClosedTime = 0;
  let totalRespondTime = 0;

  const volumeDictionary = {};

  aggregatedData.forEach(row => {
    volumeDictionary[row._id] = row;
  });

  const messageSelector = await getMessageSelector({
    args: { ...args, type: 'volume' }
  });

  const messageAggregationData = await ConversationMessages.aggregate([
    {
      $match: messageSelector
    },
    {
      $project: {
        date: await getDateFieldAsStr({
          timeFormat: aggregationTimeFormat,
          timeZone: getTimezone(user)
        })
      }
    },
    {
      $group: {
        _id: '$date',
        totalCount: { $sum: 1 }
      }
    }
  ]);

  const conversationDictionary = {};
  messageAggregationData.forEach(row => {
    conversationDictionary[row._id] = row.totalCount;
    totalConversationMessages += row.totalCount;
  });

  const resolvedDictionary = {};
  resolvedAggregatedData.forEach(row => {
    resolvedDictionary[row._id] = row.resolvedCount;
    totalResolved += row.resolvedCount;
  });

  const data: IVolumeReportExportArgs[] = [];
  const { start, end } = fixDates(startDate, endDate, diffCount);

  let begin = start;

  const generateData = async () => {
    const next = nextTime(begin, type);
    const dateKey = moment(begin).format(timeFormat);
    const {
      totalCount,
      totalResponseTime,
      totalCloseTime,
      uniqueCustomerCount,
      percentage
    } = volumeDictionary[dateKey] || {
      totalCount: 0,
      totalResponseTime: 0,
      totalCloseTime: 0,
      uniqueCustomerCount: 0,
      percentage: 0
    };
    const messageCount = conversationDictionary[dateKey] || 0;
    const resolvedCount = resolvedDictionary[dateKey] || 0;

    totalCustomerCount += totalCount;

    totalUniqueCount += uniqueCustomerCount;

    totalClosedTime += totalCloseTime;
    totalRespondTime += totalResponseTime;

    averageResponseDuration = fixNumber(totalCloseTime / totalCount);
    firstResponseDuration = fixNumber(totalResponseTime / totalCount);

    data.push({
      date: moment(begin).format(timeFormat),
      count: uniqueCustomerCount,
      customerCount: totalCount,
      customerCountPercentage: `${percentage.toFixed(0)}%`,
      messageCount,
      resolvedCount,
      averageResponseDuration: convertTime(averageResponseDuration),
      firstResponseDuration: convertTime(firstResponseDuration)
    });

    if (next.getTime() < end.getTime()) {
      begin = next;

      await generateData();
    }
  };

  await generateData();

  data.push({
    date: 'Total',
    count: totalUniqueCount,
    customerCount: totalCustomerCount,
    customerCountPercentage: `${(
      (totalUniqueCount / totalCustomerCount) *
      100
    ).toFixed(0)}%`,
    messageCount: totalConversationMessages,
    resolvedCount: totalResolved,
    averageResponseDuration: convertTime(
      fixNumber(totalClosedTime / totalCustomerCount)
    ),
    firstResponseDuration: convertTime(
      fixNumber(totalRespondTime / totalCustomerCount)
    )
  });

  return { data, start, end };
};

export const generateActivityReport = async (
  args: IListArgs,
  user: IUserDocument
) => {
  const { startDate, endDate } = args;
  const { start, end } = fixDates(startDate, endDate, 1);

  const messageSelector = await getMessageSelector({
    args: { ...args, type: 'response' }
  });

  const data = await ConversationMessages.aggregate([
    {
      $match: messageSelector
    },
    {
      $project: {
        date: await getDateFieldAsStr({
          timeFormat: '%Y-%m-%d %H',
          timeZone: getTimezone(user)
        }),
        userId: 1
      }
    },
    {
      $group: {
        _id: {
          userId: '$userId',
          date: '$date'
        },
        count: { $sum: 1 }
      }
    },
    {
      $project: {
        _id: 0,
        userId: '$_id.userId',
        date: '$_id.date',
        count: 1
      }
    }
  ]);

  return { data, start, end };
};

export const generateTagReport = async (
  args: IListArgs,
  user: IUserDocument
) => {
  const { startDate, endDate } = args;
  const { start, end } = fixDates(startDate, endDate);
  const filterSelector = getFilterSelector(args);

  const tags = await Tags.find({ type: TAG_TYPES.CONVERSATION }).select('name');

  const integrationIds = await Integrations.findIntegrations(
    filterSelector.integration
  ).select('_id');

  const rawIntegrationIds = integrationIds.map(row => row._id);

  const tagIds = tags.map(row => row._id);

  const data = await Conversations.aggregate([
    {
      $match: {
        ...noConversationSelector,
        integrationId: { $in: rawIntegrationIds },
        createdAt: filterSelector.createdAt
      }
    },
    {
      $unwind: '$tagIds'
    },
    {
      $match: {
        tagIds: { $in: tagIds }
      }
    },
    {
      $group: {
        _id: {
          tagId: '$tagIds',
          date: getDateFieldAsStr({ timeZone: getTimezone(user) })
        },
        count: { $sum: 1 }
      }
    },
    {
      $project: {
        _id: 0,
        tagId: '$_id.tagId',
        date: '$_id.date',
        count: 1
      }
    }
  ]);

  return {
    data,
    start,
    end,
    tags
  };
};

export const generateFirstResponseReport = async ({
  args,
  userId,
  user,
  type
}: {
  args: IListArgsWithUserId;
  userId?: string;
  user: IUserDocument;
  type?: string;
}) => {
  let start: Date;
  let end: Date;

  const { startDate, endDate } = args;
  const fixedDates = fixDates(startDate, endDate);

  start = fixedDates.start;
  end = fixedDates.end;

  const conversationMatch = {
    createdAt: { $gte: start, $lte: end },
    firstRespondedDate: { $exists: true },
    firstRespondedUserId: userId || { $exists: true }
  };

  const filterSelector = getFilterSelector(args);
  const selectorMatch = await getConversationSelector(
    filterSelector,
    conversationMatch
  );

  if (type === 'firstResponseOperators') {
    return Conversations.aggregate([
      {
        $match: selectorMatch
      },
      {
        $project: {
          firstRespondedUserId: 1,
          firstRespondTime: getDurationField({
            startField: '$firstRespondedDate',
            endField: '$createdAt'
          })
        }
      },
      {
        $project: {
          firstRespondedUserId: 1,
          interval: {
            $switch: {
              branches: timeIntervalBranches(),
              default: '5+ min'
            }
          }
        }
      },
      {
        $group: {
          _id: {
            userId: '$firstRespondedUserId',
            interval: '$interval'
          },
          count: { $sum: 1 }
        }
      },
      {
        $project: {
          userId: '$_id.userId',
          interval: '$_id.interval',
          count: 1
        }
      },
      {
        $lookup: {
          from: 'users',
          localField: 'userId',
          foreignField: '_id',
          as: 'userDoc'
        }
      },
      {
        $replaceRoot: {
          newRoot: {
            $mergeObjects: [{ $arrayElemAt: ['$userDoc.details', 0] }, '$$ROOT']
          }
        }
      },
      {
        $group: {
          _id: '$userId',
          title: { $first: '$fullName' },
          intervals: {
            $push: {
              name: '$interval',
              count: '$count'
            }
          }
        }
      }
    ]);
  }

  return Conversations.aggregate([
    {
      $match: selectorMatch
    },
    {
      $project: {
        date: await getDateFieldAsStr({ timeZone: getTimezone(user) }),
        firstRespondTime: getDurationField({
          startField: '$firstRespondedDate',
          endField: '$createdAt'
        })
      }
    },
    {
      $project: {
        date: 1,
        interval: {
          $switch: {
            branches: timeIntervalBranches(),
            default: '5+ min'
          }
        }
      }
    },
    {
      $group: {
        _id: {
          date: '$date',
          interval: '$interval'
        },
        count: { $sum: 1 }
      }
    },
    {
      $group: {
        _id: '$_id.date',
        title: { $first: '$_id.date' },
        intervals: {
          $push: {
            name: '$_id.interval',
            count: '$count'
          }
        }
      }
    },
    {
      $sort: {
        title: 1
      }
    }
  ]);
};
