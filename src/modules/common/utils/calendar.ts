import * as moment from 'moment';
import { __ } from '.';

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
export const monthColumns = (date: moment.Moment, range: number) => {
  let currentDate = date.clone(); // deep copy prevent mutability

  const months: any = [getMonthYear(currentDate)];

  for (let i = 0; i < range; i++) {
    currentDate = nextMonth(currentDate);
    months.push(getMonthYear(currentDate));
  }

  return months;
};

export const getCurrentDate = () => moment();

export const nextMonth = (date: moment.Moment) => {
  return date.add(1, 'month');
};

export const previousMonth = (date: moment.Moment) => {
  return date.subtract(1, 'month');
};

export const getMonthTitle = (month: number) => __(MONTHS[month]);

export const getFullTitle = (date: moment.Moment) => {
  const { month, year } = getMonthYear(date);
  return __(MONTHS[month]) + ' - ' + year;
};

const getMonthYear = (date: moment.Moment) => {
  const month = date.month();
  const year = date.year();

  return { month, year };
};
