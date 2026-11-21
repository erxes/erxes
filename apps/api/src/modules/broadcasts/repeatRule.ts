import type { broadcastSchedules } from '@erxes/core-db';
import { localDay } from '~/lib/orgTime';
import { nextRun, type Recurrence } from '~/lib/recurrence';

/** A recurring broadcast's rule and how far it has come: what the run times follow from. */
export type RepeatPlan = Recurrence &
  Pick<typeof broadcastSchedules.$inferSelect, 'endsOn' | 'maxRuns'> & { runs: number };

/** Runs one look walks at most: a daily schedule's 2¾ years. */
const MAX_STEPS = 1000;

/**
 * The run after `after`, or null once the schedule has ended: `maxRuns` made,
 * or the next time past `endsOn` (a day on the organisation's clock).
 */
export const nextRunWithin = (plan: RepeatPlan, timeZone: string, after: Date) => {
  if (plan.maxRuns !== null && plan.runs >= plan.maxRuns) return null;

  const next = nextRun(plan, timeZone, after);

  return plan.endsOn && localDay(timeZone, next) > plan.endsOn ? null : next;
};

/**
 * The latest run time at or before `now`, from `due` (the schedule's next run,
 * now past). Runs missed while the server was down are skipped: an outage
 * sends one copy, for the latest time, not a backlog.
 */
export const latestDue = (plan: RepeatPlan, timeZone: string, due: Date, now: Date) => {
  let latest = due;

  for (let step = 0; step < MAX_STEPS; step += 1) {
    const next = nextRunWithin(plan, timeZone, latest);

    if (!next || next > now) break;
    latest = next;
  }

  return latest;
};

/** Up to `count` run times from `first` on, before `until`, each counted against `maxRuns`. */
export const runsFrom = (
  plan: RepeatPlan,
  timeZone: string,
  window: { first: Date | null; until?: Date; count: number },
) => {
  const times: Date[] = [];
  let at = window.first;

  for (let runs = plan.runs; at && times.length < window.count; runs += 1) {
    if (window.until && at >= window.until) break;
    times.push(at);
    at = nextRunWithin({ ...plan, runs: runs + 1 }, timeZone, at);
  }

  return times;
};
