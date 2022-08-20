import dayjs from 'dayjs';
import { TYPES } from './constants';
import { IEvent } from './types';

export const getDaysInMonth = (month: number, year: number) => {
  const date = new Date(year, month, 1);
  const rows: Date[][] = [];
  let days: Date[] = [];

  const dayOfWeek = date.getDay();

  if (dayOfWeek !== 0) {
    for (let i = dayOfWeek - 1; i >= 0; i--) {
      days.push(new Date(year, month, i * -1));
    }
  }

  while (date.getMonth() === month) {
    days.push(new Date(date));
    date.setDate(date.getDate() + 1);

    if (date.getDay() === 0) {
      rows.push(days);
      days = [];
    }
  }

  if (days.length !== 0) {
    for (let i = 1; days.length < 7; i++) {
      days.push(new Date(year, month + 1, i));
    }

    rows.push(days);
  }

  return rows;
};

export const milliseconds = (sec: number) => {
  return sec * 1000;
};

export const calcRowCount = (wrapperHeight: number, rowHeight: number) => {
  return Math.trunc((wrapperHeight - rowHeight) / rowHeight);
};

export const extractDate = (date: Date) => {
  return {
    month: date.getMonth(),
    year: date.getFullYear(),
    date: date.getDate()
  };
};

export const generateFilters = (currentDate: Date, type: string) => {
  const { year, month, date } = extractDate(currentDate);

  let startTime = new Date(year, month, date);
  let endTime = new Date(year, month, date + 1);

  if (type === TYPES.MONTH) {
    const dates = getDaysInMonth(month, year);
    startTime = dates[0][0];
    endTime = dates[dates.length - 1][6];
  }

  if (type === TYPES.WEEK) {
    const dayOfWeek = currentDate.getDay();

    startTime = new Date(year, month, date - dayOfWeek);
    endTime = new Date(year, month, date + 7 - (dayOfWeek + 1));
  }

  return { startTime, endTime };
};

export const filterEvents = (events: IEvent[], day: Date) => {
  const second = day.getTime() / 1000;

  return events.filter(event => {
    const { start_time, end_time } = event.when;
    const startDate = new Date(milliseconds(start_time));

    return (
      startDate.toDateString() === day.toDateString() ||
      (start_time < second && end_time > second)
    );
  });
};

export const isCurrentDate = (day: Date, currentDate: Date) => {
  return (
    dayjs(currentDate).diff(day, 'day') === 0 &&
    new Date(currentDate).getDate() === day.getDate()
  );
};

// convert 24 hour to am/pm
export const timeConvert = (time: number) => {
  return `${time % 12 || 12} ${time < 12 ? 'AM' : 'PM'}`;
};

export const isSameMonth = (date: Date, currentDate: Date) => {
  return new Date(currentDate).getMonth() === date.getMonth();
};
