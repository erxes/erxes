import * as moment from 'moment';
import { Brands } from '../../../db/models';
import { IAddCellArgs, IListArgs } from './types';
import { fixDates } from './utils';

/**
 * Fix number if it is either NaN or Infinity
 */

export const fixNumber = (num: number) => {
  if (isNaN(num) || num === Infinity) {
    return 0;
  }
  return num;
};

/**
 * Time format HH:mm:ii
 */
export const convertTime = (duration: number) => {
  const hours = Math.floor(duration / 3600);
  const minutes = Math.floor((duration % 3600) / 60);
  const seconds = Math.floor((duration % 3600) % 60);

  const timeFormat = (num: number) => {
    if (num < 10) {
      return '0' + num.toString();
    }

    return num.toString();
  };

  return (
    timeFormat(hours) + ':' + timeFormat(minutes) + ':' + timeFormat(seconds)
  );
};

/**
 * Add header into excel file
 * @param title
 * @param args
 * @param excel
 */
export const addHeader = async (
  title: string,
  args: IListArgs,
  excel: any
): Promise<any> => {
  const { integrationIds = '', brandIds = '', startDate, endDate } = args;
  const selectedBrands = await Brands.find({
    _id: { $in: brandIds.split(',') }
  }).select('name');
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
export const addCell = (args: IAddCellArgs): void => {
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

export const nextTime = (start: Date, type?: string) => {
  return new Date(
    moment(start)
      .add(1, type === 'volumeByTime' ? 'hours' : 'days')
      .toString()
  );
};

export const dateToString = (date: Date) => {
  return moment(date).format('YYYY-MM-DD HH:mm');
};
