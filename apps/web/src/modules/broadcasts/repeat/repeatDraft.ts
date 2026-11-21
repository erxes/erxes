import type { BroadcastSchedule, RepeatRule } from '@erxes/core-contract';
import { format } from 'date-fns';
import { inZone, zonedDay } from '~/lib/timeZones';

export type RepeatEnds = 'never' | 'on' | 'after';

/** The Schedule dialog's repeat fields, every one filled so switching back and forth keeps them. */
export interface RepeatDraft {
  frequency: BroadcastSchedule['frequency'];
  interval: number;
  weekdays: number[];
  dayOfMonth: number;
  at: string;
  startsOn: string;
  ends: RepeatEnds;
  endsOn: string;
  maxRuns: number;
}

/** The days of a month the picker offers; 31 runs on the last day of a shorter month. */
export const MONTH_DAYS = Array.from({ length: 31 }, (_, index) => index + 1);

/** Monday … Sunday, as the API numbers them. */
export const WEEKDAYS = [1, 2, 3, 4, 5, 6, 7];

/** A date on weekday `n` (1 = Monday), for its name: 1 January 2024 was a Monday. */
export const weekdayDate = (weekday: number) => new Date(2024, 0, weekday);

/** Weekly on today's weekday at 09:00, from today on the organisation's clock, with no end. */
export const defaultDraft = (zone: string): RepeatDraft => {
  const today = inZone(new Date(), zone);

  return {
    frequency: 'week',
    interval: 1,
    weekdays: [Number(format(today, 'i'))],
    dayOfMonth: today.getDate(),
    at: '09:00',
    startsOn: zonedDay(today, zone),
    ends: 'never',
    endsOn: zonedDay(today, zone),
    maxRuns: 10,
  };
};

/** A saved schedule as the dialog's fields; those it doesn't use keep their defaults. */
export const draftOf = (schedule: BroadcastSchedule, zone: string): RepeatDraft => {
  const fallback = defaultDraft(zone);

  return {
    frequency: schedule.frequency,
    interval: schedule.interval,
    weekdays: schedule.weekdays.length ? schedule.weekdays : fallback.weekdays,
    dayOfMonth: schedule.dayOfMonth ?? fallback.dayOfMonth,
    at: schedule.at,
    startsOn: schedule.startsOn,
    ends: schedule.endsOn ? 'on' : schedule.maxRuns ? 'after' : 'never',
    endsOn: schedule.endsOn ?? fallback.endsOn,
    maxRuns: schedule.maxRuns ?? fallback.maxRuns,
  };
};

/** The rule the API takes: only the fields the frequency and the end use. */
export const ruleOf = (draft: RepeatDraft): RepeatRule => ({
  frequency: draft.frequency,
  interval: draft.interval,
  weekdays: draft.frequency === 'week' ? draft.weekdays : [],
  dayOfMonth: draft.frequency === 'month' ? draft.dayOfMonth : null,
  at: draft.at,
  startsOn: draft.startsOn,
  endsOn: draft.ends === 'on' ? draft.endsOn : null,
  maxRuns: draft.ends === 'after' ? draft.maxRuns : null,
});

/** What the API would refuse, so the dialog says it before asking. */
export const isRuleComplete = (draft: RepeatDraft) =>
  draft.interval >= 1 &&
  /^\d{2}:\d{2}$/.test(draft.at) &&
  Boolean(draft.startsOn) &&
  (draft.frequency !== 'week' || draft.weekdays.length > 0) &&
  (draft.ends !== 'on' || draft.endsOn >= draft.startsOn) &&
  (draft.ends !== 'after' || draft.maxRuns >= 1);
