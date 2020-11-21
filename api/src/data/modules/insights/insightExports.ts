import * as moment from 'moment';
import { Users } from '../../../db/models';
import { IUserDocument } from '../../../db/models/definitions/users';
import { INSIGHT_BASIC_INFOS } from '../../constants';
import { can } from '../../permissions/utils';
import { createXlsFile, generateXlsx } from '../../utils';
import {
  generateActivityReport,
  generateFirstResponseReport,
  generateTagReport,
  generateVolumeReport
} from './exportData';
import { addCell, addHeader, dateToString, nextTime } from './exportUtils';
import {
  IListArgs,
  IListArgsWithUserId,
  IResponseFirstResponseExport
} from './types';
import { fixDates, timeIntervals } from './utils';

const checkPermission = async (user: IUserDocument) => {
  if (!(await can('manageExportInsights', user))) {
    throw new Error('Permission denied');
  }
};

/*
 * Volume report export
 */
export const insightVolumeReportExport = async (
  args: IListArgs,
  user: IUserDocument
) => {
  await checkPermission(user);

  const { type } = args;
  const { data, start, end } = await generateVolumeReport(args, user);
  const basicInfos = INSIGHT_BASIC_INFOS;

  // Reads default template
  const { workbook, sheet } = await createXlsFile();
  const header = `Volume Report By ${
    type === 'volumeByTime' ? 'Time' : 'Date'
  }`;

  await addHeader(header, args, sheet);

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
        cols
      });
    }
  }

  const name = `${header} - ${dateToString(start)} - ${dateToString(end)}`;

  return {
    name,
    response: await generateXlsx(workbook)
  };
};

/*
 * Operator Activity Report
 */
export const insightActivityReportExport = async (
  args: IListArgs,
  user: IUserDocument
) => {
  await checkPermission(user);

  const { data, start, end } = await generateActivityReport(args, user);

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
  let begin = start;

  const cols: string[] = [];

  const generateData = async () => {
    const next = nextTime(begin, 'volumeByTime');

    rowIndex++;

    addCell({
      sheet,
      rowIndex,
      col: 'date',
      value: moment(begin).format('YYYY-MM-DD HH'),
      cols
    });

    for (const userId of userIds) {
      if (!users[userId]) {
        const { details, email } = (await Users.findOne({
          _id: userId
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
        cols
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
    cols
  });

  for (const userId of userIds) {
    addCell({
      sheet,
      rowIndex,
      col: users[userId],
      value: userTotals[userId],
      cols
    });
  }

  // Write to file.
  const name = `Operator Activity report - ${dateToString(
    start
  )} - ${dateToString(end)}`;

  return {
    name,
    response: await generateXlsx(workbook)
  };
};

/*
 * First Response Report
 */
export const insightFirstResponseReportExport = async (
  args: IListArgsWithUserId,
  user: IUserDocument
) => {
  await checkPermission(user);

  const { startDate, endDate, userId, type } = args;
  const { start, end } = fixDates(startDate, endDate);

  // Reads default template
  const { workbook, sheet } = await createXlsFile();
  const cols: string[] = [];

  let rowIndex = 3;

  for (const interval of timeIntervals) {
    rowIndex++;

    addCell({
      sheet,
      rowIndex,
      col: 'time',
      value: interval.name,
      cols
    });
  }

  let fullName = '';

  if (userId) {
    const { details, email } = (await Users.findOne({
      _id: userId
    })) as IUserDocument;

    fullName = `${(details && details.fullName) || email || ''} `;
  }

  const insertCell = async (params: { userId?: string; type?: string }) => {
    const datas: IResponseFirstResponseExport[] = await generateFirstResponseReport(
      { args, ...params, user }
    );

    for (const data of datas) {
      rowIndex = 3;
      const intervals = data.intervals || [];

      for (const interval of timeIntervals) {
        rowIndex++;

        const userInterval = intervals.find(i => i.name === interval.name);

        await addCell({
          sheet,
          rowIndex,
          col: data.title,
          value: userInterval ? userInterval.count : 0,
          cols
        });
      }
    }
  };

  await addHeader(`${fullName} First Response`, args, sheet);

  await insertCell({ type, userId });

  // Write to file.
  const name = `${fullName}First Response - ${dateToString(
    start
  )} - ${dateToString(end)}`;

  return {
    name,
    response: await generateXlsx(workbook)
  };
};

/*
 * Tag Report
 */
export const insightTagReportExport = async (
  args: IListArgs,
  user: IUserDocument
) => {
  await checkPermission(user);

  const { data, start, end, tags } = await generateTagReport(args, user);

  const tagDictionary = {};

  data.map(row => {
    tagDictionary[`${row.tagId}_${row.date}`] = row.count;
  });

  // Reads default template
  const { workbook, sheet } = await createXlsFile();
  await addHeader('Tag Report', args, sheet);

  let rowIndex = 3;
  const cols: string[] = [];

  let begin = start;

  const generateData = async () => {
    const next = nextTime(begin);
    rowIndex++;

    addCell({
      sheet,
      rowIndex,
      col: 'date',
      value: moment(begin).format('YYYY-MM-DD'),
      cols
    });

    // count conversations by each tag
    for (const tag of tags) {
      // find conversation counts of given tag
      const tagKey = `${tag._id}_${moment(begin).format('YYYY-MM-DD')}`;
      const count = tagDictionary[tagKey] ? tagDictionary[tagKey] : 0;
      tagDictionary[`${tag._id}_total`] =
        (tagDictionary[`${tag._id}_total`] || 0) + count;

      addCell({
        sheet,
        rowIndex,
        col: tag.name,
        value: count,
        cols
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
    cols
  });

  for (const tag of tags) {
    addCell({
      sheet,
      rowIndex,
      col: tag.name,
      value: tagDictionary[`${tag.id}_total`],
      cols
    });
  }

  // Write to file.
  const name = `Tag report - ${dateToString(start)} - ${dateToString(end)}`;

  return {
    name,
    response: await generateXlsx(workbook)
  };
};

const main = (args: IListArgs, user: IUserDocument) => {
  const { type } = args;

  if (type === 'volumeByDate') {
    return insightVolumeReportExport(args, user);
  }

  if (type === 'volumeByTime') {
    return insightVolumeReportExport(args, user);
  }

  if (type === 'activity') {
    return insightActivityReportExport(args, user);
  }

  if (type === 'firstResponseDuration') {
    return insightFirstResponseReportExport(args, user);
  }

  if (type === 'firstResponseOperators') {
    return insightFirstResponseReportExport(args, user);
  }

  if (type === 'tag') {
    return insightTagReportExport(args, user);
  }

  throw new Error('Invalid type');
};

export default main;
