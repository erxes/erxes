import type { IModels } from '~/connectionResolvers';
import { PAPA_DELIVERED_STATUSES, PAPA_ORDER_STATUS } from './constants';

export const PAPA_REPORT_INTERVALS = ['day', 'month'] as const;

export type TPapaReportInterval = (typeof PAPA_REPORT_INTERVALS)[number];

// A day report longer than a year is no longer readable as a table.
const MAX_REPORT_DAYS = 366;
const DAY_MS = 24 * 60 * 60 * 1000;

export interface IPapaReportArgs {
  posId?: string | null;
  startDate: Date | string;
  endDate: Date | string;
  interval?: string | null;
  timezone?: string | null;
}

/** One period's deliveries, by when they were sent to Papa. */
export interface IPapaReportRow {
  period: string;
  sent: number;
  delivered: number;
  cancelled: number;
  failed: number;
  inProgress: number;
  /** Order totals of the delivered orders. */
  revenue: number;
  /** Papa's fee for the delivered orders. */
  papaCost: number;
}

export type TPapaReportGroup = Omit<IPapaReportRow, 'inProgress'>;

export const isPapaReportInterval = (
  value: unknown,
): value is TPapaReportInterval =>
  typeof value === 'string' &&
  (PAPA_REPORT_INTERVALS as readonly string[]).includes(value);

const toTimezone = (value?: string | null) => {
  if (!value) {
    return 'UTC';
  }

  try {
    new Intl.DateTimeFormat('en', { timeZone: value });
    return value;
  } catch {
    return 'UTC';
  }
};

const toDate = (value: Date | string, name: string) => {
  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    throw new TypeError(`${name} is not a valid date`);
  }

  return date;
};

/** Rows with the still-open deliveries, and the totals over them. */
export const summarizePapaReport = (groups: TPapaReportGroup[]) => {
  const rows: IPapaReportRow[] = groups.map((group) => ({
    ...group,
    inProgress: Math.max(
      group.sent - group.delivered - group.cancelled - group.failed,
      0,
    ),
  }));

  const totals = rows.reduce<Omit<IPapaReportRow, 'period'>>(
    (sum, row) => ({
      sent: sum.sent + row.sent,
      delivered: sum.delivered + row.delivered,
      cancelled: sum.cancelled + row.cancelled,
      failed: sum.failed + row.failed,
      inProgress: sum.inProgress + row.inProgress,
      revenue: sum.revenue + row.revenue,
      papaCost: sum.papaCost + row.papaCost,
    }),
    {
      sent: 0,
      delivered: 0,
      cancelled: 0,
      failed: 0,
      inProgress: 0,
      revenue: 0,
      papaCost: 0,
    },
  );

  return { rows, totals };
};

const countWhen = (condition: Record<string, unknown>) => ({
  $sum: { $cond: [condition, 1, 0] },
});

const sumWhen = (condition: Record<string, unknown>, field: string) => ({
  $sum: { $cond: [condition, { $ifNull: [field, 0] }, 0] },
});

/**
 * Papa deliveries sent in `[startDate, endDate)`, per day or month in the
 * viewer's time zone: how many were sent, delivered, cancelled by the store
 * and failed (Papa cancelled or no driver), the delivered orders' revenue and
 * Papa's fee for them.
 */
export const getPapaDeliveryReport = async (
  models: IModels,
  args: IPapaReportArgs,
) => {
  const start = toDate(args.startDate, 'Start date');
  const end = toDate(args.endDate, 'End date');

  if (end <= start) {
    throw new Error('End date must be after start date');
  }

  const interval: TPapaReportInterval = isPapaReportInterval(args.interval)
    ? args.interval
    : 'day';

  if (
    interval === 'day' &&
    end.getTime() - start.getTime() > MAX_REPORT_DAYS * DAY_MS
  ) {
    throw new Error('A daily report covers at most a year; report by month');
  }

  const timezone = toTimezone(args.timezone);
  const match: Record<string, unknown> = {
    'papaDelivery.papaOrderId': { $nin: [null, ''] },
    'papaDelivery.sentAt': { $gte: start, $lt: end },
  };

  if (args.posId) {
    const pos = await models.Pos.findOne({ _id: args.posId }, { token: 1 })
      .lean()
      .exec();

    if (!pos) {
      throw new Error('POS not found');
    }

    match.posToken = pos.token;
  }

  const status = '$papaDelivery.status';
  const delivered = { $in: [status, PAPA_DELIVERED_STATUSES] };

  const groups: TPapaReportGroup[] = await models.PosOrders.aggregate([
    { $match: match },
    {
      $group: {
        _id: {
          $dateToString: {
            format: interval === 'month' ? '%Y-%m' : '%Y-%m-%d',
            date: '$papaDelivery.sentAt',
            timezone,
          },
        },
        sent: { $sum: 1 },
        delivered: countWhen(delivered),
        cancelled: countWhen({
          $eq: [status, PAPA_ORDER_STATUS.USER_CANCELLED],
        }),
        failed: countWhen({
          $in: [
            status,
            [PAPA_ORDER_STATUS.CANCELLED, PAPA_ORDER_STATUS.EXPIRED],
          ],
        }),
        revenue: sumWhen(delivered, '$totalAmount'),
        papaCost: sumWhen(delivered, '$papaDelivery.price'),
      },
    },
    { $sort: { _id: 1 } },
    {
      $project: {
        _id: 0,
        period: '$_id',
        sent: 1,
        delivered: 1,
        cancelled: 1,
        failed: 1,
        revenue: 1,
        papaCost: 1,
      },
    },
  ]);

  return { interval, timezone, ...summarizePapaReport(groups) };
};
