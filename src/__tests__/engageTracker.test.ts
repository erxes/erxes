import * as moment from 'moment';
import { createScheduleRule } from '../trackers/engageScheduleTracker';

describe('Engage tracker tests', async () => {
  test('Create schedule cron job by year', () => {
    const doc = {
      type: 'year',
      month: 2,
      day: 14,
      time: moment('2018-08-22T12:25:00').toString(),
    };

    const rule = createScheduleRule(doc);

    expect(rule).toBe('25 12 14 2 *');
  });

  test('Create schedule cron job by month', () => {
    const doc = {
      type: 'month',
      day: 14,
      time: moment('2018-08-22T12:25:00').toString(),
    };

    const rule = createScheduleRule(doc);

    expect(rule).toBe('25 12 14 * *');
  });

  test('Create schedule cron job by day', () => {
    const doc = {
      type: 'day',
      time: moment('2018-08-22T12:25:00').toString(),
    };

    const rule = createScheduleRule(doc);

    expect(rule).toBe('25 12 * * *');
  });

  test('Create schedule cron job by week day', () => {
    const doc = {
      type: '5',
      time: moment('2018-08-22T12:25:00').toString(),
    };

    const rule = createScheduleRule(doc);

    expect(rule).toBe('25 12 * * 5');
  });

  test('Create default schedule cron job', () => {
    const doc = {
      type: '',
      month: '',
      day: '',
    };

    const rule = createScheduleRule(doc);

    expect(rule).toBe('* 45 23 * ');
  });
});
