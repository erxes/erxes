import moment from 'moment';
import { __ } from '.';
import { IDateColumn } from '../types';

const MONTHS = [
  'January',
  'February',
  'March',
  'April',
  'May',
  'June',
  'July',
  'August',
  'September',
  'October',
  'November',
  'December'
];

/**
 * Get columns of months
 * @param date - current date
 * @param range - range of months to get
 */
export const monthColumns = (
  date: moment.Moment,
  range: number
): [IDateColumn] => {
  let currentDate = date.clone(); // deep copy prevent mutability

  const months: any = [getMonthYear(currentDate)];

  for (let i = 0; i < range; i++) {
    currentDate = nextMonth(currentDate);
    months.push(getMonthYear(currentDate));
  }

  return months;
};

export const getCurrentDate = (): moment.Moment => moment();

export const nextMonth = (date: moment.Moment): moment.Moment => {
  return date.add(1, 'month');
};

export const previousMonth = (date: moment.Moment): moment.Moment => {
  return date.subtract(1, 'month');
};

export const getMonthTitle = (month: number): string => __(MONTHS[month]);

export const getFullTitle = (date: IDateColumn): string => {
  const { month, year } = date;
  return __(MONTHS[month]) + ' - ' + year;
};

export const getMonthYear = (
  date: moment.Moment
): { month: number; year: number } => {
  const month = date.month();
  const year = date.year();

  return { month, year };
};
