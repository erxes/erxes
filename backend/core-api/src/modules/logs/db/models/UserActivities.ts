import {
  IUserActivityDailyDocument,
  USER_ACTIVITY_DAY_MS,
  USER_ACTIVITY_SLOT_MS,
  userActivityDailySchema,
} from 'erxes-api-shared/core-modules';
import { Model } from 'mongoose';

export const MAX_ACTIVITY_DAYS = 90;

export interface IUserActivitySummary {
  activeMinutes: number;
  lastActiveAt: Date | null;
}

export interface IUserActivityDay {
  date: string;
  activeMembers: number;
  minutes: number;
}

export interface IUserActivitiesModel extends Model<IUserActivityDailyDocument> {
  getActivitySummary(
    userId: string,
    days: number,
  ): Promise<IUserActivitySummary>;
  getActivitySlots(userId: string, days: number): Promise<number[]>;
  getActivityByUser(
    userIds: string[],
    days: number,
  ): Promise<Map<string, IUserActivitySummary>>;
  getTeamDailySeries(
    userIds: string[],
    days: number,
    timeZone: string,
  ): Promise<IUserActivityDay[]>;
}

const windowStart = (days: number) => {
  const windowDays = Math.min(
    Math.max(Math.floor(days) || 1, 1),
    MAX_ACTIVITY_DAYS,
  );

  return Date.now() - windowDays * USER_ACTIVITY_DAY_MS;
};

const utcDayOf = (ms: number) => new Date(ms - (ms % USER_ACTIVITY_DAY_MS));

// An unknown zone would fail the whole aggregation
const safeTimeZone = (timeZone: string) => {
  try {
    new Intl.DateTimeFormat('en-US', { timeZone });
    return timeZone;
  } catch {
    return 'UTC';
  }
};

export const loadUserActivitiesClass = (models) => {
  class UserActivities {
    /** Rolling window of the last `days` × 24h, so no timezone is involved. */
    public static async getActivitySummary(userId: string, days: number) {
      const sinceMs = windowStart(days);
      const sinceSlot = Math.floor(sinceMs / USER_ACTIVITY_SLOT_MS);

      const [row] = await models.UserActivities.aggregate([
        {
          $match: {
            userId,
            utcDay: { $gte: utcDayOf(sinceMs) },
          },
        },
        { $unwind: '$slots' },
        { $match: { slots: { $gte: sinceSlot } } },
        { $group: { _id: null, count: { $sum: 1 } } },
      ]);

      // Last activity may be older than the window, so it is looked up separately
      const latest = await models.UserActivities.findOne(
        { userId },
        { lastSlot: 1 },
      )
        .sort({ utcDay: -1 })
        .lean();

      return {
        activeMinutes: (row?.count ?? 0) * (USER_ACTIVITY_SLOT_MS / 60_000),
        lastActiveAt: latest
          ? new Date(latest.lastSlot * USER_ACTIVITY_SLOT_MS)
          : null,
      };
    }

    /** Raw slots in the window; the viewer groups them into local days and hours. */
    public static async getActivitySlots(userId: string, days: number) {
      const sinceMs = windowStart(days);
      const sinceSlot = Math.floor(sinceMs / USER_ACTIVITY_SLOT_MS);

      const rows = await models.UserActivities.find(
        { userId, utcDay: { $gte: utcDayOf(sinceMs) } },
        { slots: 1 },
      ).lean();

      return rows
        .flatMap((row: { slots: number[] }) => row.slots)
        .filter((slot: number) => slot >= sinceSlot)
        .sort((a: number, b: number) => a - b);
    }

    /** Minutes in the window and last activity ever, for many members in two queries. */
    public static async getActivityByUser(userIds: string[], days: number) {
      const sinceMs = windowStart(days);
      const sinceSlot = Math.floor(sinceMs / USER_ACTIVITY_SLOT_MS);
      const slotMinutes = USER_ACTIVITY_SLOT_MS / 60_000;

      const [inWindow, latest] = await Promise.all([
        models.UserActivities.aggregate([
          {
            $match: {
              userId: { $in: userIds },
              utcDay: { $gte: utcDayOf(sinceMs) },
            },
          },
          { $unwind: '$slots' },
          { $match: { slots: { $gte: sinceSlot } } },
          { $group: { _id: '$userId', count: { $sum: 1 } } },
        ]),
        models.UserActivities.aggregate([
          { $match: { userId: { $in: userIds } } },
          { $group: { _id: '$userId', lastSlot: { $max: '$lastSlot' } } },
        ]),
      ]);

      const counts = new Map<string, number>(
        inWindow.map((row: { _id: string; count: number }) => [
          row._id,
          row.count,
        ]),
      );
      const summaries = new Map<string, IUserActivitySummary>();

      for (const row of latest as { _id: string; lastSlot: number }[]) {
        summaries.set(row._id, {
          activeMinutes: (counts.get(row._id) ?? 0) * slotMinutes,
          lastActiveAt: new Date(row.lastSlot * USER_ACTIVITY_SLOT_MS),
        });
      }

      return summaries;
    }

    /** Per local day in the viewer's zone: distinct active members and team minutes. */
    public static async getTeamDailySeries(
      userIds: string[],
      days: number,
      timeZone: string,
    ) {
      // One extra day so the oldest local day is complete in any zone
      const sinceMs = windowStart(days) - USER_ACTIVITY_DAY_MS;
      const sinceSlot = Math.floor(sinceMs / USER_ACTIVITY_SLOT_MS);
      const slotMinutes = USER_ACTIVITY_SLOT_MS / 60_000;

      const rows: { _id: string; members: number; count: number }[] =
        await models.UserActivities.aggregate([
          {
            $match: {
              userId: { $in: userIds },
              utcDay: { $gte: utcDayOf(sinceMs) },
            },
          },
          { $unwind: '$slots' },
          { $match: { slots: { $gte: sinceSlot } } },
          {
            $group: {
              _id: {
                $dateToString: {
                  format: '%Y-%m-%d',
                  date: {
                    $toDate: { $multiply: ['$slots', USER_ACTIVITY_SLOT_MS] },
                  },
                  timezone: safeTimeZone(timeZone),
                },
              },
              users: { $addToSet: '$userId' },
              count: { $sum: 1 },
            },
          },
          { $project: { members: { $size: '$users' }, count: 1 } },
          { $sort: { _id: 1 } },
        ]);

      return rows.map((row) => ({
        date: row._id,
        activeMembers: row.members,
        minutes: row.count * slotMinutes,
      }));
    }
  }

  userActivityDailySchema.loadClass(UserActivities);

  return userActivityDailySchema;
};
