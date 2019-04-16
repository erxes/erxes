import * as moment from 'moment';
import { ConversationMessages, Conversations, Integrations, Tags, Users } from '../../../../db/models';
import { IUserDocument } from '../../../../db/models/definitions/users';
import { INSIGHT_BASIC_INFOS, TAG_TYPES } from '../../../constants';
import { moduleCheckPermission } from '../../../permissions';
import { createXlsFile, generateXlsx } from '../../../utils';
import { getDateFieldAsStr, getDurationField } from '../aggregationUtils';
import { IListArgs, IListArgsWithUserId, IVolumeReportExportArgs } from './types';
import {
  findConversations,
  fixDates,
  generateMessageSelector,
  getConversationSelector,
  getFilterSelector,
  getTimezone,
} from './utils';

import { addCell, addHeader, convertTime, dateToString, fixNumber, nextTime } from './exportUtils';

const timeIntervals: string[] = [
  '0-5 second',
  '6-10 second',
  '11-15 second',
  '16-20 second',
  '21-25 second',
  '26-30 second',
  '31-35 second',
  '36-40 second',
  '41-45 second',
  '46-50 second',
  '51-55 second',
  '56-60 second',
  '1-2 min',
  '2-3 min',
  '3-4 min',
  '4-5 min',
  '5+ min',
];

const insightExportQueries = {
  /*
   * Volume report export
   */
  async insightVolumeReportExport(_root, args: IListArgs, { user }: { user: IUserDocument }) {
    const { startDate, endDate, type } = args;

    let diffCount = 7;
    let timeFormat = 'YYYY-MM-DD';
    let aggregationTimeFormat = '%Y-%m-%d';

    if (type === 'time') {
      diffCount = 1;
      timeFormat = 'YYYY-MM-DD HH';
      aggregationTimeFormat = '%Y-%m-%d %H';
    }

    const { start, end } = fixDates(startDate, endDate, diffCount);
    const conversationSelector = {
      createdAt: { $gte: start, $lte: end },
      $or: [{ userId: { $exists: true }, messageCount: { $gt: 1 } }, { userId: { $exists: false } }],
    };

    const mainSelector = await getConversationSelector(args, conversationSelector);
    const conversations = await Conversations.find(mainSelector);
    const conversationRawIds = conversations.map(row => row._id);
    const aggregatedData = await Conversations.aggregate([
      {
        $match: mainSelector,
      },
      {
        $project: {
          date: await getDateFieldAsStr({ timeFormat: aggregationTimeFormat, timeZone: getTimezone(user) }),
          customerId: 1,
          status: 1,
          closeTime: getDurationField({ startField: '$closedAt', endField: '$createdAt' }),
          firstRespondTime: getDurationField({ startField: '$firstRespondedDate', endField: '$createdAt' }),
        },
      },
      {
        $group: {
          _id: '$date',
          uniqueCustomerIds: { $addToSet: '$customerId' },
          resolvedCount: {
            $sum: { $cond: [{ $eq: ['$status', 'closed'] }, 1, 0] },
          },
          totalCount: { $sum: 1 },
          totalResponseTime: { $sum: '$firstRespondTime' },
          totalCloseTime: { $sum: '$closeTime' },
        },
      },
      {
        $project: {
          uniqueCustomerCount: { $size: '$uniqueCustomerIds' },
          totalCount: 1,
          totalCloseTime: 1,
          totalResponseTime: 1,
          resolvedCount: 1,
          percentage: {
            $multiply: [
              {
                $divide: [{ $size: '$uniqueCustomerIds' }, '$totalCount'],
              },
              100,
            ],
          },
        },
      },
    ]);

    const volumeDictionary = {};

    let totalCustomerCount = 0;
    let totalUniqueCount = 0;
    let totalConversationMessages = 0;
    let totalResolved = 0;

    let averageResponseDuration = 0;
    let firstResponseDuration = 0;
    let totalClosedTime = 0;
    let totalRespondTime = 0;

    aggregatedData.forEach(row => {
      volumeDictionary[row._id] = row;
    });

    const messageAggregationData = await ConversationMessages.aggregate([
      {
        $match: {
          conversationId: { $in: conversationRawIds },
          createdAt: { $gte: start, $lte: end },
        },
      },
      {
        $project: {
          date: await getDateFieldAsStr({ timeFormat: aggregationTimeFormat, timeZone: getTimezone(user) }),
          status: 1,
        },
      },
      {
        $group: {
          _id: '$date',
          totalCount: { $sum: 1 },
        },
      },
    ]);

    const conversationDictionary = {};
    messageAggregationData.forEach(row => {
      conversationDictionary[row._id] = row.totalCount;
      totalConversationMessages += row.totalCount;
    });

    const data: IVolumeReportExportArgs[] = [];

    let begin = start;
    const generateData = async () => {
      const next = nextTime(begin, type);
      const dateKey = moment(begin).format(timeFormat);
      const {
        resolvedCount,
        totalCount,
        totalResponseTime,
        totalCloseTime,
        uniqueCustomerCount,
        percentage,
      } = volumeDictionary[dateKey] || {
        resolvedCount: 0,
        totalCount: 0,
        totalResponseTime: 0,
        totalCloseTime: 0,
        uniqueCustomerCount: 0,
        percentage: 0,
      };
      const messageCount = conversationDictionary[dateKey] || 0;

      totalCustomerCount += totalCount;
      totalResolved += resolvedCount;

      totalUniqueCount += uniqueCustomerCount;

      totalClosedTime += totalCloseTime;
      totalRespondTime += totalResponseTime;

      averageResponseDuration = fixNumber(totalCloseTime / resolvedCount);
      firstResponseDuration = fixNumber(totalResponseTime / totalCount);

      data.push({
        date: moment(begin).format(timeFormat),
        count: uniqueCustomerCount,
        customerCount: totalCount,
        customerCountPercentage: `${percentage.toFixed(0)}%`,
        messageCount,
        resolvedCount,
        averageResponseDuration: convertTime(averageResponseDuration),
        firstResponseDuration: convertTime(firstResponseDuration),
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
      customerCountPercentage: `${((totalUniqueCount / totalCustomerCount) * 100).toFixed(0)}%`,
      messageCount: totalConversationMessages,
      resolvedCount: totalResolved,
      averageResponseDuration: convertTime(fixNumber(totalClosedTime / totalResolved)),
      firstResponseDuration: convertTime(fixNumber(totalRespondTime / totalCustomerCount)),
    });

    const basicInfos = INSIGHT_BASIC_INFOS;

    // Reads default template
    const { workbook, sheet } = await createXlsFile();
    await addHeader(`Volume Report By ${type || 'date'}`, args, sheet);

    let rowIndex: number = 3;
    const cols: string[] = [];

    for (const obj of data) {
      rowIndex++;

      // Iterating through coc basic infos
      for (const info of basicInfos.ALL) {
        addCell({
          sheet,
          rowIndex,
          col: basicInfos[info],
          value: obj[info],
          cols,
        });
      }
    }

    // Write to file.
    return generateXlsx(workbook, `Volume report By ${type || 'date'} - ${dateToString(start)} - ${dateToString(end)}`);
  },

  /*
   * Operator Activity Report
   */
  async insightActivityReportExport(_root, args: IListArgs, { user }: { user: IUserDocument }) {
    const { startDate, endDate } = args;
    const { start, end } = fixDates(startDate, endDate, 1);

    const messageSelector = await generateMessageSelector({ args, type: 'response' });

    const data = await ConversationMessages.aggregate([
      {
        $match: messageSelector,
      },
      {
        $project: {
          date: await getDateFieldAsStr({ timeFormat: '%Y-%m-%d %H', timeZone: getTimezone(user) }),
          userId: 1,
        },
      },
      {
        $group: {
          _id: {
            userId: '$userId',
            date: '$date',
          },
          count: { $sum: 1 },
        },
      },
      {
        $project: {
          _id: 0,
          userId: '$_id.userId',
          date: '$_id.date',
          count: 1,
        },
      },
    ]);

    const userDataDictionary = {};
    const rawUserIds = {};
    const userTotals = {};
    data.forEach(row => {
      userDataDictionary[`${row.userId}_${row.date}`] = row.count;
      rawUserIds[row.userId] = 1;
    });
    const userIds = Object.keys(rawUserIds);

    const users: any = {};

    // Reads default template
    const { workbook, sheet } = await createXlsFile();
    await addHeader('Operator Activity report', args, sheet);
    let rowIndex = 3;
    const cols: string[] = [];

    let begin = start;
    const generateData = async () => {
      const next = nextTime(begin, 'time');
      rowIndex++;

      addCell({
        sheet,
        rowIndex,
        col: 'date',
        value: moment(begin).format('YYYY-MM-DD HH'),
        cols,
      });

      for (const userId of userIds) {
        if (!users[userId]) {
          const { details, email } = (await Users.findOne({
            _id: userId,
          })) as IUserDocument;

          users[userId] = (details && details.fullName) || email;
        }
        const key = moment(begin).format('YYYY-MM-DD HH');
        const count = userDataDictionary[`${userId}_${key}`] || 0;
        userTotals[userId] = (userTotals[userId] || 0) + count;
        addCell({
          sheet,
          rowIndex,
          col: users[userId],
          value: count,
          cols,
        });
      }

      if (next.getTime() < end.getTime()) {
        begin = next;

        await generateData();
      }
    };

    await generateData();

    // add total
    rowIndex++;
    addCell({
      sheet,
      rowIndex,
      col: 'date',
      value: 'Total',
      cols,
    });

    for (const userId of userIds) {
      addCell({
        sheet,
        rowIndex,
        col: users[userId],
        value: userTotals[userId],
        cols,
      });
    }

    // Write to file.
    return generateXlsx(workbook, `Operator Activity report - ${dateToString(start)} - ${dateToString(end)}`);
  },

  /*
   * First Response Report
   */
  async insightFirstResponseReportExport(_root, args: IListArgsWithUserId) {
    const { startDate, endDate, userId, type } = args;
    const filterSelector = getFilterSelector(args);
    const { start, end } = fixDates(startDate, endDate);

    // Reads default template
    const { workbook, sheet } = await createXlsFile();
    let rowIndex = 3;
    const cols: string[] = [];

    for (const t of timeIntervals) {
      rowIndex++;

      addCell({
        sheet,
        rowIndex,
        col: 'time',
        value: t,
        cols,
      });
    }

    let begin = start;
    const lastIndex = timeIntervals.length - 1;

    const insertCell = async (conversationSelector, col) => {
      const messageCounts: number[] = [];

      timeIntervals.forEach(() => {
        messageCounts.push(0);
      });

      const conversations = await findConversations(filterSelector, conversationSelector);

      // Processes total first response time for each users.
      for (const conversation of conversations) {
        rowIndex = 3;
        const { firstRespondedDate, createdAt } = conversation;

        let responseTime = 0;

        // checking wheter or not this is actual conversation
        if (firstRespondedDate) {
          responseTime = createdAt.getTime() - firstRespondedDate.getTime();
          responseTime = Math.abs(responseTime / 1000);

          const minute = Math.floor(responseTime / 60);
          let index = 0;

          if (minute < 1) {
            const second = Math.floor(responseTime / 5);
            index = second;
          } else {
            index = 60 / 5 - 1 + minute;

            if (index > lastIndex) {
              index = lastIndex;
            }
          }

          messageCounts[index] = messageCounts[index] + 1;
        }

        for (const count of messageCounts) {
          rowIndex++;

          addCell({
            sheet,
            rowIndex,
            col,
            value: count,
            cols,
          });
        }
      }
    };

    let fullName = '';

    if (userId) {
      const { details, email } = (await Users.findOne({
        _id: userId,
      })) as IUserDocument;

      fullName = `${(details && details.fullName) || email || ''} `;
    }

    if (type === 'operator') {
      const users = await Users.find();

      await addHeader(`${fullName} First Response`, args, sheet);

      for (const user of users) {
        const { _id, details, username } = user;

        const conversationSelector = {
          createdAt: { $gte: start, $lte: end },
          firstRespondedDate: { $ne: null },
          firstRespondedUserId: _id,
        };

        await insertCell(conversationSelector, (details && details.fullName) || username);
      }
    } else {
      const generateData = async () => {
        const next = nextTime(begin);

        const conversationSelector = {
          createdAt: { $gte: begin, $lte: next },
          firstRespondedDate: { $ne: null },
          firstRespondedUserId: userId ? userId : { $exists: true },
        };

        await insertCell(conversationSelector, moment(begin).format('YYYY-MM-DD'));

        if (next.getTime() < end.getTime()) {
          begin = next;

          await generateData();
        }
      };

      await addHeader(`${fullName} First Response`, args, sheet);
      await generateData();
    }

    // Write to file.
    return generateXlsx(workbook, `${fullName}First Response - ${dateToString(start)} - ${dateToString(end)}`);
  },

  /*
   * Tag Report
   */
  async insightTagReportExport(_root, args: IListArgs, { user }: { user: IUserDocument }) {
    const { startDate, endDate } = args;
    const { start, end } = fixDates(startDate, endDate);
    const filterSelector = getFilterSelector(args);

    const tags = await Tags.find({ type: TAG_TYPES.CONVERSATION }).select('name');

    const integrationIds = await Integrations.find(filterSelector.integration).select('_id');

    // Reads default template
    const { workbook, sheet } = await createXlsFile();
    await addHeader('Tag Report', args, sheet);

    let rowIndex = 3;
    const cols: string[] = [];

    let begin = start;
    const rawIntegrationIds = integrationIds.map(row => row._id);

    const tagIds = tags.map(row => row._id);
    const tagDictionary = {};
    const tagData = await Conversations.aggregate([
      {
        $match: {
          $or: [{ userId: { $exists: true }, messageCount: { $gt: 1 } }, { userId: { $exists: false } }],
          integrationId: { $in: rawIntegrationIds },
          createdAt: filterSelector.createdAt,
        },
      },
      {
        $unwind: '$tagIds',
      },
      {
        $match: {
          tagIds: { $in: tagIds },
        },
      },
      {
        $group: {
          _id: {
            tagId: '$tagIds',
            date: getDateFieldAsStr({ timeZone: getTimezone(user) }),
          },
          count: { $sum: 1 },
        },
      },
      {
        $project: {
          _id: 0,
          tagId: '$_id.tagId',
          date: '$_id.date',
          count: 1,
        },
      },
    ]);
    tagData.map(row => {
      tagDictionary[`${row.tagId}_${row.date}`] = row.count;
    });

    const generateData = async () => {
      const next = nextTime(begin);
      rowIndex++;

      addCell({
        sheet,
        rowIndex,
        col: 'date',
        value: moment(begin).format('YYYY-MM-DD'),
        cols,
      });

      // count conversations by each tag
      for (const tag of tags) {
        // find conversation counts of given tag
        const tagKey = `${tag._id}_${moment(begin).format('YYYY-MM-DD')}`;
        const count = tagDictionary[tagKey] ? tagDictionary[tagKey] : 0;
        tagDictionary[`${tag._id}_total`] = (tagDictionary[`${tag._id}_total`] || 0) + count;

        addCell({
          sheet,
          rowIndex,
          col: tag.name,
          value: count,
          cols,
        });
      }

      if (next.getTime() < end.getTime()) {
        begin = next;

        await generateData();
      }
    };

    await generateData();

    // add total values
    rowIndex++;
    addCell({
      sheet,
      rowIndex,
      col: 'date',
      value: 'Total',
      cols,
    });

    for (const tag of tags) {
      addCell({
        sheet,
        rowIndex,
        col: tag.name,
        value: tagDictionary[`${tag.id}_total`],
        cols,
      });
    }

    // Write to file.
    return generateXlsx(workbook, `Tag report - ${dateToString(start)} - ${dateToString(end)}`);
  },
};

moduleCheckPermission(insightExportQueries, 'manageExportInsights');

export default insightExportQueries;
