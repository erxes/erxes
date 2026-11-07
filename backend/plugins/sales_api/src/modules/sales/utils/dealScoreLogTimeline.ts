import { sendTRPCMessage } from 'erxes-api-shared/utils';
import { FilterQuery } from 'mongoose';
import { IModels } from '~/connectionResolvers';
import { IDealDocument } from '@/sales/@types';
import { emptyKinds, kindOfRow, round, TKinds } from './scoreLogSums';

// What loyalty sums in one call.
const TIMELINE_BATCH = 1000;
const DAY = 24 * 60 * 60 * 1000;

export const TIMELINE_PERIODS = { day: 30, week: 26, month: 12 } as const;

export type TTimelineInterval = keyof typeof TIMELINE_PERIODS;

type TLoyaltyBucket = {
  bucket: string;
  action: string;
  recalculates?: string | null;
  total: number;
};

export const isTimeZone = (value: string) => {
  try {
    new Intl.DateTimeFormat('en-US', { timeZone: value });

    return true;
  } catch {
    return false;
  }
};

const pad = (value: number) => String(value).padStart(2, '0');

// Today's calendar date where the asker is, as that date's UTC midnight.
const localToday = (timezone: string, now: Date) => {
  const parts = new Intl.DateTimeFormat('en-US', {
    timeZone: timezone,
    year: 'numeric',
    month: 'numeric',
    day: 'numeric',
  }).formatToParts(now);
  const part = (type: string) =>
    Number(parts.find((item) => item.type === type)?.value);

  return Date.UTC(part('year'), part('month') - 1, part('day'));
};

const dayKey = (time: number) => {
  const date = new Date(time);

  return `${date.getUTCFullYear()}-${pad(date.getUTCMonth() + 1)}-${pad(
    date.getUTCDate(),
  )}`;
};

// ISO week, as loyalty's `%G-W%V`: the week belongs to its Thursday's year.
const weekKey = (time: number) => {
  const weekday = (new Date(time).getUTCDay() + 6) % 7;
  const thursday = time + (3 - weekday) * DAY;
  const year = new Date(thursday).getUTCFullYear();
  const week = 1 + Math.floor((thursday - Date.UTC(year, 0, 1)) / (7 * DAY));

  return `${year}-W${pad(week)}`;
};

/** The periods a timeline shows, oldest first, ending with the current one. */
export const timelineKeys = (
  interval: TTimelineInterval,
  timezone: string,
  now = new Date(),
) => {
  const today = localToday(timezone, now);
  const count = TIMELINE_PERIODS[interval];

  return Array.from({ length: count }, (_, index) => {
    const back = count - 1 - index;

    if (interval === 'day') {
      return dayKey(today - back * DAY);
    }

    if (interval === 'week') {
      return weekKey(today - back * 7 * DAY);
    }

    const date = new Date(today);
    const month = new Date(
      Date.UTC(date.getUTCFullYear(), date.getUTCMonth() - back, 1),
    );

    return `${month.getUTCFullYear()}-${pad(month.getUTCMonth() + 1)}`;
  });
};

/**
 * The points the matching deals moved per period, summed by loyalty over the
 * entries each deal links. `cumulative` starts from everything those deals
 * moved before the first period; it is their net, not a wallet's balance.
 */
export const dealScoreLogTimeline = async (
  models: IModels,
  subdomain: string,
  filter: FilterQuery<IDealDocument>,
  interval: TTimelineInterval,
  timezone: string,
  now = new Date(),
) => {
  const deals = await models.Deals.find(
    { ...filter, 'scoreLogIds.0': { $exists: true } },
    { _id: 1, scoreLogIds: 1 },
  ).lean();

  return scoreLogTimeline(
    subdomain,
    deals.flatMap(({ scoreLogIds }) => scoreLogIds || []),
    interval,
    timezone,
    now,
  );
};

/** The same, for any source's linked entries. */
export const scoreLogTimeline = async (
  subdomain: string,
  ids: string[],
  interval: TTimelineInterval,
  timezone: string,
  now = new Date(),
) => {
  const rows: TLoyaltyBucket[] = [];

  for (let i = 0; i < ids.length; i += TIMELINE_BATCH) {
    const part: TLoyaltyBucket[] = await sendTRPCMessage({
      subdomain,
      pluginName: 'loyalty',
      method: 'query',
      module: 'score',
      action: 'timelineByIds',
      input: { ids: ids.slice(i, i + TIMELINE_BATCH), interval, timezone },
      throwOnError: true,
    });

    rows.push(...(part || []));
  }

  const keys = timelineKeys(interval, timezone, now);
  const byKey = new Map<string, TKinds>(keys.map((key) => [key, emptyKinds()]));
  let opening = 0;

  for (const row of rows) {
    // A recalculation's entries count apart from what was first given.
    const kind = kindOfRow(row);

    // The keys sort as text, so anything before the first is history.
    if (row.bucket < keys[0]) {
      opening += row.total;
      continue;
    }

    const line = byKey.get(row.bucket);

    if (line) {
      line[kind] += row.total;
      line.net += row.total;
    }
  }

  let running = opening;

  return {
    interval,
    buckets: keys.map((key) => {
      const line = byKey.get(key) || emptyKinds();

      running += line.net;

      return {
        key,
        earned: round(line.earned),
        spent: round(line.spent),
        refunded: round(line.refunded),
        other: round(line.other),
        recalculated: round(line.recalculatedEarned + line.recalculatedSpent),
        net: round(line.net),
        cumulative: round(running),
      };
    }),
  };
};
