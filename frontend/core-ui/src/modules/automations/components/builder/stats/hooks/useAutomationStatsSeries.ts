import { TAutomationStatsBucket } from '@/automations/types';
import dayjs from 'dayjs';
import { useMemo } from 'react';

const EMPTY_BUCKET = { total: 0, complete: 0, error: 0, waiting: 0 };

// One bucket per day of the range, so days without runs still take a bar
const fillDays = (
  timeSeries: TAutomationStatsBucket[],
  beginDate: Date,
  endDate: Date,
) => {
  const byDate = new Map(timeSeries.map((bucket) => [bucket.date, bucket]));
  const filled: TAutomationStatsBucket[] = [];
  const last = dayjs(endDate).startOf('day');

  for (
    let day = dayjs(beginDate).startOf('day');
    !day.isAfter(last);
    day = day.add(1, 'day')
  ) {
    const date = day.format('YYYY-MM-DD');
    filled.push(byDate.get(date) ?? { date, ...EMPTY_BUCKET });
  }

  return filled;
};

export const formatChartDay = (date: string) => dayjs(date).format('MMM D');

export const useAutomationStatsSeries = (
  timeSeries: TAutomationStatsBucket[],
  beginDate: Date,
  endDate: Date,
) =>
  useMemo(
    () => fillDays(timeSeries, beginDate, endDate),
    [timeSeries, beginDate, endDate],
  );
