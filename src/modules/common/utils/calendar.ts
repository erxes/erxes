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

const onMonthChange = (date: moment.Moment) => {
  let currentDate = date.clone(); // deep copy prevent mutability

  const months: any = [getMonthYear(currentDate)];

  for (let i = 0; i < 3; i++) {
    currentDate = nextMonth(currentDate);
    months.push(getMonthYear(currentDate));
  }

  return months;
};

const getCurrentMonth = () => {
  return moment();
};

const nextMonth = (date: moment.Moment) => {
  return date.add(1, 'month');
};

const previousMonth = (date: moment.Moment) => {
  return date.subtract(1, 'month');
};

const getMonthYear = (date: moment.Moment, hasYear?: boolean) => {
  const month = date.month();
  const year = date.year();

  const title = __(MONTHS[month]) + (hasYear ? ' - ' + year : '');

  return { month, year, title };
};

export {
  getCurrentMonth,
  nextMonth,
  previousMonth,
  onMonthChange,
  getMonthYear
};
