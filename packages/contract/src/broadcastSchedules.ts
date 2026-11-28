import { broadcastSchedules } from '@erxes/core-db/schema';
import { oc } from '@orpc/contract';
import { createSelectSchema, createUpdateSchema } from 'drizzle-zod';
import { z } from 'zod';
import { Id, isoDate, listOf, readsByPost } from './common';
import { COMMON_ERRORS, ERRORS } from './errors';
import { BroadcastChannel } from './values';

/** 1 = Monday … 7 = Sunday, each once. */
const Weekdays = z
  .array(z.int().min(1).max(7))
  .max(7)
  .refine((days) => new Set(days).size === days.length, 'each weekday once');

const Day = z.iso.date();

const TimeOfDay = z.string().regex(/^([01]\d|2[0-3]):[0-5]\d$/, 'HH:MM');

/** A recurring broadcast's schedule, on the organisation's clock. */
export const BroadcastSchedule = createSelectSchema(broadcastSchedules, {
  broadcastId: Id,
  interval: () => z.int(),
  weekdays: () => z.array(z.int()),
  dayOfMonth: () => z.int().nullable(),
  maxRuns: () => z.int().nullable(),
  runs: () => z.int(),
  nextRunAt: isoDate,
  lastRunAt: isoDate,
  updatedAt: isoDate,
}).pick({
  broadcastId: true,
  frequency: true,
  /** Every N days, weeks or months, counted from `startsOn`. */
  interval: true,
  /** `week`: 1 = Monday … 7 = Sunday. */
  weekdays: true,
  /** `month`: the day; in a shorter month (31 in April) the last day. */
  dayOfMonth: true,
  /** `HH:MM` in the organisation's time zone. */
  at: true,
  startsOn: true,
  /** The last day it may run. */
  endsOn: true,
  /** It ends after this many runs. */
  maxRuns: true,
  state: true,
  /** The next run, while active. */
  nextRunAt: true,
  /** Runs so far: broadcasts whose `parentId` is this one. */
  runs: true,
  lastRunAt: true,
  updatedAt: true,
});

export type BroadcastSchedule = z.infer<typeof BroadcastSchedule>;

const RuleFields = createUpdateSchema(broadcastSchedules, {
  interval: () => z.int().min(1).max(99),
  weekdays: () => Weekdays,
  dayOfMonth: () => z.int().min(1).max(31).nullable(),
  at: () => TimeOfDay,
  startsOn: () => Day,
  endsOn: () => Day.nullable(),
  maxRuns: () => z.int().min(1).max(1000).nullable(),
})
  .pick({
    frequency: true,
    interval: true,
    weekdays: true,
    dayOfMonth: true,
    at: true,
    startsOn: true,
    endsOn: true,
    maxRuns: true,
  })
  .required({ frequency: true, at: true, startsOn: true });

/**
 * How a broadcast repeats: `week` needs `weekdays`, `month` a `dayOfMonth`;
 * it ends on `endsOn`, after `maxRuns`, or never (neither).
 */
const ruleIssues = (rule: z.infer<typeof RuleFields>, context: z.RefinementCtx) => {
  if (rule.frequency === 'week' && !rule.weekdays?.length) {
    context.addIssue({ code: 'custom', path: ['weekdays'], message: 'pick at least one day' });
  }

  if (rule.frequency === 'month' && !rule.dayOfMonth) {
    context.addIssue({ code: 'custom', path: ['dayOfMonth'], message: 'pick a day' });
  }

  if (rule.endsOn && rule.maxRuns) {
    context.addIssue({ code: 'custom', path: ['maxRuns'], message: 'an end date or a count' });
  }

  if (rule.endsOn && rule.endsOn < rule.startsOn) {
    context.addIssue({ code: 'custom', path: ['endsOn'], message: 'on or after the start' });
  }
};

export const RepeatRule = RuleFields.superRefine(ruleIssues);

export type RepeatRule = z.infer<typeof RepeatRule>;

/** A run of a recurring broadcast that hasn't happened yet, for the calendar. */
export const UpcomingRun = z.object({
  broadcastId: Id,
  name: z.string(),
  channel: BroadcastChannel,
  at: isoDate(),
});

export type UpcomingRun = z.infer<typeof UpcomingRun>;

const {
  BROADCAST_STATUS,
  BROADCAST_INCOMPLETE,
  EMAIL_NOT_CONFIGURED,
  REPEAT_STATE,
  SMS_NOT_CONFIGURED,
} = ERRORS;

const base = oc.errors({ ...COMMON_ERRORS, BROADCAST_STATUS, REPEAT_STATE });

const ById = z.object({ id: Id });

const WithRule = RuleFields.extend({ id: Id }).superRefine(ruleIssues);

/** The calendar's window: at most 62 days. */
const Window = z
  .object({ from: z.iso.datetime({ offset: true }), to: z.iso.datetime({ offset: true }) })
  .refine(
    ({ from, to }) => {
      const days = (Date.parse(to) - Date.parse(from)) / 86_400_000;

      return days > 0 && days <= 62;
    },
    { path: ['to'], message: 'after `from`, at most 62 days' },
  );

/** Recurring broadcasts: each run of the schedule sends a copy of the broadcast as it is then. */
export const broadcastSchedulesContract = {
  get: base
    .route({
      method: 'GET',
      path: '/broadcasts/{id}/schedule',
      summary: 'Get a repeat schedule',
      description: "A broadcast's repeat schedule; null when it doesn't repeat",
    })
    .input(ById)
    .output(BroadcastSchedule.nullable()),
  start: base
    .errors({ BROADCAST_INCOMPLETE, EMAIL_NOT_CONFIGURED, SMS_NOT_CONFIGURED })
    .route({
      method: 'POST',
      path: '/broadcasts/{id}/schedule/start',
      summary: 'Make a broadcast repeat',
      description:
        'Make a draft recurring on this schedule: from now each run sends a copy of it, the audience counted then. 409 BROADCAST_STATUS unless a draft, EMAIL_NOT_CONFIGURED or SMS_NOT_CONFIGURED when the channel can’t deliver',
    })
    .input(WithRule)
    .output(BroadcastSchedule),
  save: base
    .route({
      method: 'PUT',
      path: '/broadcasts/{id}/schedule',
      summary: 'Change a repeat schedule',
      description:
        'Change the schedule; runs already made stay. On a draft it is kept until it starts. 409 BROADCAST_STATUS unless a draft or recurring, REPEAT_STATE once it ended',
    })
    .input(WithRule)
    .output(BroadcastSchedule),
  pause: base
    .route({
      method: 'POST',
      path: '/broadcasts/{id}/schedule/pause',
      summary: 'Pause a repeat schedule',
      description: 'Make no runs until resumed. 409 REPEAT_STATE unless active',
    })
    .input(ById)
    .output(BroadcastSchedule),
  resume: base
    .errors({ EMAIL_NOT_CONFIGURED, SMS_NOT_CONFIGURED })
    .route({
      method: 'POST',
      path: '/broadcasts/{id}/schedule/resume',
      summary: 'Resume a repeat schedule',
      description:
        'Run again from the next time after now; times missed while paused are skipped. 409 REPEAT_STATE unless paused, EMAIL_NOT_CONFIGURED or SMS_NOT_CONFIGURED when the channel can’t deliver',
    })
    .input(ById)
    .output(BroadcastSchedule),
  stop: base
    .route({
      method: 'POST',
      path: '/broadcasts/{id}/schedule/stop',
      summary: 'End a repeat schedule',
      description: 'End it for good; its runs stay. 409 REPEAT_STATE once it ended',
    })
    .input(ById)
    .output(BroadcastSchedule),
  preview: base
    .route({
      method: 'POST',
      path: '/broadcast-schedules/preview',
      spec: readsByPost,
      summary: 'Preview repeat times',
      description:
        'The next times a schedule would run, after now and within its end, on the organisation’s clock',
    })
    .input(RuleFields.extend({ count: z.int().min(1).max(10).default(5) }).superRefine(ruleIssues))
    .output(z.object({ runs: z.array(isoDate()) })),
  upcoming: base
    .route({
      method: 'GET',
      path: '/broadcast-schedules/upcoming',
      summary: 'List upcoming repeat runs',
      description:
        'Runs of active recurring broadcasts not made yet, between `from` (or now) and `to` (at most 62 days)',
    })
    .input(Window)
    .output(listOf(UpcomingRun)),
};
