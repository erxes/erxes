/* eslint-env jest */
/* eslint-disable no-underscore-dangle */

import moment from 'moment';
import { createScheduleRule } from '../trackers/engageScheduleTracker';

describe('Engage tracker tests', async () => {
  test('Create schedule cron job rule', () => {
    const doc = {
      type: 'year',
      month: 2,
      day: 14,
      time: moment('2018-08-22T12:25:00'),
    };

    const rule = createScheduleRule(doc);

    // Date of month [0-11]
    expect(rule.month).toBe(1);

    expect(rule.date).toBe(14);
    expect(rule.hour).toBe(12);
    expect(rule.minute).toBe(25);
    expect(rule.second).toBe(0);
    expect(rule.dayOfWeek).toBe(null);
  });
});
