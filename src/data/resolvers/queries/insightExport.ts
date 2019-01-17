import * as moment from 'moment';
import { Brands, ConversationMessages, Conversations, Integrations, Tags, Users } from '../../../db/models';
import { IUserDocument } from '../../../db/models/definitions/users';
import { INSIGHT_BASIC_INFOS, TAG_TYPES } from '../../constants';
import { moduleRequireLogin } from '../../permissions';
import { createXlsFile, generateXlsx } from '../../utils';
import { getDateFieldAsStr, getDurationField } from './aggregationUtils';
import {
  findConversations,
  fixDates,
  generateMessageSelector,
  generateUserSelector,
  getConversationSelector,
  getFilterSelector,
  IListArgs,
} from './insightUtils';

interface IVolumeReportExportArgs {
  date: string;
  count: number;
  customerCount: number;
  customerCountPercentage: string;
  messageCount: number;
  resolvedCount: number;
  averageResponseDuration: string;
  firstResponseDuration: string;
}

interface IAddCellArgs {
  sheet: any;
  cols: string[];
  rowIndex: number;
  col: string;
  value: string | number;
}

export interface IListArgsWithUserId extends IListArgs {
  userId?: string;
}

/**
 * Time format HH:mm:ii
 */
const convertTime = (duration: number) => {
  const hours = Math.floor(duration / 3600);
  const minutes = Math.floor((duration % 3600) / 60);
  const seconds = Math.floor((duration % 3600) % 60);

  const timeFormat = (num: number) => {
    if (num < 10) {
      return '0' + num.toString();
    }

    return num.toString();
  };

  return timeFormat(hours) + ':' + timeFormat(minutes) + ':' + timeFormat(seconds);
};

/**
 * Add header into excel file
 * @param title
 * @param args
 * @param excel
 */
const addHeader = async (title: string, args: IListArgs, excel: any): Promise<any> => {
  const { integrationIds = '', brandIds = '', startDate, endDate } = args;
  const selectedBrands = await Brands.find({ _id: { $in: brandIds.split(',') } }).select('name');
  const brandNames = selectedBrands.map(row => row.name).join(',');
  const { start, end } = fixDates(startDate, endDate);
  excel.cell(1, 1).value(title);
  excel.cell(2, 1).value('date:');
  excel.cell(2, 2).value(`${dateToString(start)}-${dateToString(end)}`);
  excel.cell(2, 4).value('Integration:');
  excel.cell(2, 5).value(integrationIds);
  excel.cell(2, 6).value('Brand:');
  excel.cell(2, 7).value(brandNames || '');
  return {};
};

/*
 * Sheet add cell
 */
const addCell = (args: IAddCellArgs): void => {
  const { cols, sheet, col, rowIndex, value } = args;

  // Checking if existing column
  if (cols.includes(col)) {
    // If column already exists adding cell
    sheet.cell(rowIndex, cols.indexOf(col) + 1).value(value);
  } else {
    // Creating column
    sheet
      .column(cols.length + 1)
      .width(25)
      .hidden(false);
    sheet.cell(3, cols.length + 1).value(col);
    // Creating cell
    sheet.cell(rowIndex, cols.length + 1).value(value);

    cols.push(col);
  }
};

const nextTime = (start: Date, type?: string) => {
  return new Date(
    moment(start)
      .add(1, type ? 'hours' : 'days')
      .toString(),
  );
};

const dateToString = (date: Date) => {
  return moment(date).format('YYYY-MM-DD HH:mm');
};

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
  async insightVolumeReportExport(_root, args: IListArgs) {
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
          date: await getDateFieldAsStr({ timeFormat: aggregationTimeFormat }),
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
          averageCloseTime: { $avg: '$closeTime' },
          averageRespondTime: { $avg: '$firstRespondTime' },
        },
      },
      {
        $project: {
          uniqueCustomerCount: { $size: '$uniqueCustomerIds' },
          totalCount: 1,
          averageCloseTime: 1,
          averageRespondTime: 1,
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

    let totalSumCount = 0;
    let totalCustomerCount = 0;
    let totalConversationMessages = 0;
    let totalResolved = 0;
    let totalAverageClosed = 0;
    let totalAverageRespond = 0;
    let totalRowCount = 0;

    aggregatedData.forEach(row => {
      volumeDictionary[row._id] = row;
    });

    const messageAggregationData = await ConversationMessages.aggregate([
      {
        $match: {
          conversationId: { $in: conversationRawIds },
        },
      },
      {
        $project: {
          date: await getDateFieldAsStr({ timeFormat: aggregationTimeFormat }),
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
        averageCloseTime,
        averageRespondTime,
        uniqueCustomerCount,
        percentage,
      } = volumeDictionary[dateKey] || {
        resolvedCount: 0,
        totalCount: 0,
        averageCloseTime: 0,
        averageRespondTime: 0,
        uniqueCustomerCount: 0,
        percentage: 0,
      };
      const messageCount = conversationDictionary[dateKey];

      totalSumCount += totalCount;
      totalResolved += resolvedCount;
      totalAverageClosed += averageCloseTime;
      totalAverageRespond += averageRespondTime;
      totalCustomerCount += uniqueCustomerCount;
      totalRowCount += 1;

      data.push({
        date: moment(begin).format(timeFormat),
        count: totalCount,
        customerCount: uniqueCustomerCount,
        customerCountPercentage: `${percentage.toFixed(0)}%`,
        messageCount,
        resolvedCount,
        averageResponseDuration: convertTime(averageCloseTime),
        firstResponseDuration: convertTime(averageRespondTime),
      });

      if (next.getTime() < end.getTime()) {
        begin = next;

        await generateData();
      }
    };

    await generateData();

    data.push({
      date: 'Total',
      count: totalSumCount,
      customerCount: totalCustomerCount,
      customerCountPercentage: `${(totalCustomerCount / totalSumCount).toFixed(0)}%`,
      messageCount: totalConversationMessages,
      resolvedCount: totalResolved,
      averageResponseDuration: convertTime(totalAverageClosed / totalRowCount),
      firstResponseDuration: convertTime(totalAverageRespond / totalRowCount),
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
  async insightActivityReportExport(_root, args: IListArgs) {
    const { startDate, endDate } = args;
    const { start, end } = fixDates(startDate, endDate, 1);

    const messageSelector = await generateMessageSelector(
      args,
      // message selector
      {
        userId: generateUserSelector('response'),
      },
    );

    const data = await ConversationMessages.aggregate([
      {
        $match: messageSelector,
      },
      {
        $project: {
          date: await getDateFieldAsStr({ timeFormat: '%Y-%m-%d %H' }),
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
  async insightTagReportExport(_root, args: IListArgs) {
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
            date: {
              $dateToString: {
                format: '%Y-%m-%d',
                date: '$createdAt',
              },
            },
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

moduleRequireLogin(insightExportQueries);

export default insightExportQueries;
