import * as moment from 'moment';
import * as _ from 'underscore';
import { ConversationMessages, Conversations, Integrations, Tags, Users } from '../../../db/models';
import { IUserDocument } from '../../../db/models/definitions/users';
import { INSIGHT_BASIC_INFOS, TAG_TYPES } from '../../constants';
import { moduleRequireLogin } from '../../permissions';
import { createXlsFile, generateXlsx } from '../../utils';
import { findConversations, fixDates, generateMessageSelector, generateUserSelector, IListArgs } from './insightUtils';

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

interface IDurationWithCount {
  duration: number;
  count: number;
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
const convertTime = ({ duration, count }: { duration: number; count: number }) => {
  if (count === 0) {
    return '-';
  }

  const second = Math.floor(duration / (count * 1000));
  const hours = Math.floor(second / 3600);
  const minutes = Math.floor((second - hours * 3600) / 60);
  const seconds = second - hours * 3600 - minutes * 60;

  const timeFormat = (num: number) => {
    if (num < 10) {
      return '0' + num.toString();
    }

    return num.toString();
  };

  return timeFormat(hours) + ':' + timeFormat(minutes) + ':' + timeFormat(seconds);
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
    sheet.cell(1, cols.length + 1).value(col);
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
    const { integrationType, brandId, startDate, endDate, type } = args;
    let diffCount = 7;
    let timeFormat = 'YYYY-MM-DD';

    if (type === 'time') {
      diffCount = 1;
      timeFormat = 'YYYY-MM-DD HH';
    }

    const { start, end } = fixDates(startDate, endDate, diffCount);
    const conversationSelector = {
      createdAt: { $gte: start, $lte: end },
      $or: [{ userId: { $exists: true }, messageCount: { $gt: 1 } }, { userId: { $exists: false } }],
    };

    const conversations = await findConversations({ kind: integrationType, brandId }, conversationSelector);

    const data: IVolumeReportExportArgs[] = [];

    let begin = start;
    const generateData = async () => {
      const next = nextTime(begin, type);

      const filtered = conversations.filter(
        conv => begin.getTime() < conv.createdAt.getTime() && conv.createdAt.getTime() < next.getTime(),
      );

      const conversationIds = _.pluck(filtered, '_id');
      const customerCount = _.unique(_.pluck(filtered, 'customerId')).length;
      const customerCountPercentage = `${
        filtered.length !== 0 ? Math.floor((100 * customerCount) / filtered.length) : 0
      }%`;
      const messageCount = await ConversationMessages.countDocuments({ conversationId: { $in: conversationIds } });
      const resolvedCount = filtered.filter(conv => (conv.status = 'closed')).length;
      const closedDuration: IDurationWithCount = { duration: 0, count: 0 };
      const firstDuration: IDurationWithCount = { duration: 0, count: 0 };

      for (const conv of filtered) {
        const { createdAt, closedAt, firstRespondedDate } = conv;

        if (!createdAt) {
          break;
        }

        const createTime = createdAt.getTime();

        if (closedAt) {
          closedDuration.duration = closedDuration.duration + closedAt.getTime() - createTime;
          closedDuration.count = closedDuration.count + 1;
        }

        if (firstRespondedDate) {
          firstDuration.duration = firstDuration.duration + firstRespondedDate.getTime() - createTime;
          firstDuration.count = firstDuration.count + 1;
        }
      }

      data.push({
        date: moment(begin).format(timeFormat),
        count: filtered.length,
        customerCount,
        customerCountPercentage,
        messageCount,
        resolvedCount,
        averageResponseDuration: convertTime(closedDuration),
        firstResponseDuration: convertTime(firstDuration),
      });

      if (next.getTime() < end.getTime()) {
        begin = next;

        await generateData();
      }
    };

    await generateData();

    const basicInfos = INSIGHT_BASIC_INFOS;

    // Reads default template
    const { workbook, sheet } = await createXlsFile();

    let rowIndex: number = 1;
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
    return generateXlsx(workbook, `Volume report - ${dateToString(start)} - ${dateToString(end)}`);
  },

  /*
   * Operator Activity Report
   */
  async insightActivityReportExport(_root, args: IListArgs) {
    const { integrationType, brandId, startDate, endDate } = args;
    const { start, end } = fixDates(startDate, endDate, 1);

    const messageSelector = await generateMessageSelector(
      brandId,
      integrationType,
      // conversation selector
      {},
      // message selector
      {
        userId: generateUserSelector('response'),
        createdAt: { $gte: start, $lte: end },
      },
    );

    const messages = await ConversationMessages.find(messageSelector);
    const userIds = _.uniq(_.pluck(messages, 'userId'));
    const users: any = {};

    // Reads default template
    const { workbook, sheet } = await createXlsFile();
    let rowIndex = 1;
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
        const count = messages.filter(msg => {
          return (
            begin.getTime() < msg.createdAt.getTime() &&
            msg.createdAt.getTime() < next.getTime() &&
            msg.userId === userId
          );
        }).length;

        if (!users[userId]) {
          const { details, email } = (await Users.findOne({ _id: userId })) as IUserDocument;

          users[userId] = (details && details.fullName) || email;
        }

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

    // Write to file.
    return generateXlsx(workbook, `Activity report - ${dateToString(start)} - ${dateToString(end)}`);
  },

  /*
   * First Response Report
   */
  async insightFirstResponseReportExport(_root, args: IListArgsWithUserId) {
    const { integrationType, brandId, startDate, endDate, userId, type } = args;
    const { start, end } = fixDates(startDate, endDate);

    // Reads default template
    const { workbook, sheet } = await createXlsFile();
    let rowIndex = 1;
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

      const conversations = await findConversations({ kind: integrationType, brandId }, conversationSelector);

      // Processes total first response time for each users.
      for (const conversation of conversations) {
        rowIndex = 1;
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

    if (type === 'operator') {
      const users = await Users.find();

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

      await generateData();
    }

    let fullName = '';

    if (userId) {
      const { details, email } = (await Users.findOne({ _id: userId })) as IUserDocument;

      fullName = `${(details && details.fullName) || email || ''} `;
    }

    // Write to file.
    return generateXlsx(workbook, `${fullName}First Response - ${dateToString(start)} - ${dateToString(end)}`);
  },

  /*
   * Tag Report
   */
  async insightTagReportExport(_root, args: IListArgs) {
    const { integrationType, brandId, startDate, endDate } = args;
    const { start, end } = fixDates(startDate, endDate);

    const integrationSelector: { brandId?: string; kind?: string } = {};

    if (brandId) {
      integrationSelector.brandId = brandId;
    }

    const tags = await Tags.find({ type: TAG_TYPES.CONVERSATION }).select('name');

    if (integrationType) {
      integrationSelector.kind = integrationType;
    }

    const integrationIds = await Integrations.find(integrationSelector).select('_id');

    // Reads default template
    const { workbook, sheet } = await createXlsFile();
    let rowIndex = 1;
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
          createdAt: { $gte: start, $lte: end },
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
                timezone: '+08',
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
    console.log('tagData:', tagDictionary);
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

    // Write to file.
    return generateXlsx(workbook, `Tag report - ${dateToString(start)} - ${dateToString(end)}`);
  },
};

moduleRequireLogin(insightExportQueries);

export default insightExportQueries;
