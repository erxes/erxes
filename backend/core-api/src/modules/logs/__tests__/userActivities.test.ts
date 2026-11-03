/**
 * Activity summary against real MongoDB: minutes come from distinct 5-minute
 * slots inside a rolling window, last activity from the newest slot overall.
 */
import { DATABASE } from './userActivitiesTestEnv';
import mongoose from 'mongoose';
import {
  USER_ACTIVITY_DAY_MS,
  USER_ACTIVITY_SLOT_MS,
} from 'erxes-api-shared/core-modules';
import { generateModels, IModels } from '~/connectionResolvers';

jest.setTimeout(30_000);

let models: IModels;

const slotAt = (ms: number) => Math.floor(ms / USER_ACTIVITY_SLOT_MS);

// Same write the logs worker performs for one touch
const touch = (userId: string, at: number) =>
  models.UserActivities.updateOne(
    { userId, utcDay: new Date(at - (at % USER_ACTIVITY_DAY_MS)) },
    { $addToSet: { slots: slotAt(at) }, $max: { lastSlot: slotAt(at) } },
    { upsert: true },
  );

beforeAll(async () => {
  models = await generateModels('test');
  await mongoose.connection.asPromise();
  await models.UserActivities.init();
}, 60_000);

afterEach(async () => {
  await models.UserActivities.collection.deleteMany({});
});

afterAll(async () => {
  mongoose.connection.removeAllListeners('disconnected');
  await mongoose.disconnect();
  const cleanup = await mongoose
    .createConnection('mongodb://127.0.0.1:27017/admin?directConnection=true')
    .asPromise();
  await cleanup.useDb(DATABASE).dropDatabase();
  await cleanup.useDb(`${DATABASE}_logs`).dropDatabase();
  await cleanup.close();
});

describe('UserActivities.getActivitySummary', () => {
  it('counts each slot once, however many devices touched it', async () => {
    const now = Date.now();

    await touch('u1', now);
    await touch('u1', now);
    await touch('u1', now - USER_ACTIVITY_SLOT_MS);

    const summary = await models.UserActivities.getActivitySummary('u1', 7);

    expect(summary.activeMinutes).toBe(10);
    expect(summary.lastActiveAt?.getTime()).toBe(
      slotAt(now) * USER_ACTIVITY_SLOT_MS,
    );
  });

  it('leaves slots older than the window out of minutes but not of last activity', async () => {
    const now = Date.now();
    const tenDaysAgo = now - 10 * USER_ACTIVITY_DAY_MS;

    await touch('u1', tenDaysAgo);

    const summary = await models.UserActivities.getActivitySummary('u1', 7);

    expect(summary.activeMinutes).toBe(0);
    expect(summary.lastActiveAt?.getTime()).toBe(
      slotAt(tenDaysAgo) * USER_ACTIVITY_SLOT_MS,
    );
  });

  it('adds up slots across UTC days and keeps users apart', async () => {
    const now = Date.now();

    await touch('u1', now);
    await touch('u1', now - USER_ACTIVITY_DAY_MS);
    await touch('u2', now);

    expect(
      (await models.UserActivities.getActivitySummary('u1', 7)).activeMinutes,
    ).toBe(10);
    expect(
      (await models.UserActivities.getActivitySummary('u2', 7)).activeMinutes,
    ).toBe(5);
  });

  it('returns nothing for a member who was never active', async () => {
    const summary = await models.UserActivities.getActivitySummary('u3', 7);

    expect(summary).toEqual({ activeMinutes: 0, lastActiveAt: null });
  });
});

describe('UserActivities.getActivitySlots', () => {
  it('returns distinct slots inside the window in time order', async () => {
    const now = Date.now();
    const yesterday = now - USER_ACTIVITY_DAY_MS;

    await touch('u1', now);
    await touch('u1', yesterday);
    await touch('u1', now);
    await touch('u1', now - 40 * USER_ACTIVITY_DAY_MS);
    await touch('u2', now);

    expect(await models.UserActivities.getActivitySlots('u1', 30)).toEqual([
      slotAt(yesterday),
      slotAt(now),
    ]);
  });

  it('caps the window at 90 days', async () => {
    const now = Date.now();

    await touch('u1', now - 100 * USER_ACTIVITY_DAY_MS);
    await touch('u1', now - 80 * USER_ACTIVITY_DAY_MS);

    expect(await models.UserActivities.getActivitySlots('u1', 365)).toEqual([
      slotAt(now - 80 * USER_ACTIVITY_DAY_MS),
    ]);
  });
});

describe('UserActivities.getActivityByUser', () => {
  it('returns window minutes and last activity for each member that has any', async () => {
    const now = Date.now();
    const twentyDaysAgo = now - 20 * USER_ACTIVITY_DAY_MS;

    await touch('u1', now);
    await touch('u1', now - USER_ACTIVITY_SLOT_MS);
    await touch('u2', twentyDaysAgo);
    await touch('u3', now);

    const byUser = await models.UserActivities.getActivityByUser(
      ['u1', 'u2', 'u4'],
      7,
    );

    expect(byUser.get('u1')).toEqual({
      activeMinutes: 10,
      lastActiveAt: new Date(slotAt(now) * USER_ACTIVITY_SLOT_MS),
    });
    expect(byUser.get('u2')).toEqual({
      activeMinutes: 0,
      lastActiveAt: new Date(slotAt(twentyDaysAgo) * USER_ACTIVITY_SLOT_MS),
    });
    expect(byUser.has('u3')).toBe(false);
    expect(byUser.has('u4')).toBe(false);
  });
});

describe('UserActivities.getTeamDailySeries', () => {
  it('groups slots into local days of the given zone with distinct members', async () => {
    // 20:00 UTC is already the next day in Ulaanbaatar (UTC+8)
    const lateUtc = new Date();
    lateUtc.setUTCHours(20, 0, 0, 0);
    if (lateUtc.getTime() > Date.now()) {
      lateUtc.setUTCDate(lateUtc.getUTCDate() - 1);
    }
    const at = lateUtc.getTime();

    await touch('u1', at);
    await touch('u1', at + USER_ACTIVITY_SLOT_MS);
    await touch('u2', at);

    const local = new Date(at + 8 * 60 * 60 * 1000).toISOString().slice(0, 10);
    const series = await models.UserActivities.getTeamDailySeries(
      ['u1', 'u2'],
      7,
      'Asia/Ulaanbaatar',
    );

    expect(series).toEqual([{ date: local, activeMembers: 2, minutes: 15 }]);
  });

  it('falls back to UTC for an unknown zone instead of failing', async () => {
    const now = Date.now();
    await touch('u1', now);

    const series = await models.UserActivities.getTeamDailySeries(
      ['u1'],
      7,
      'Not/AZone',
    );

    expect(series).toEqual([
      {
        date: new Date(slotAt(now) * USER_ACTIVITY_SLOT_MS)
          .toISOString()
          .slice(0, 10),
        activeMembers: 1,
        minutes: 5,
      },
    ]);
  });
});
