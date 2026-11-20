import { broadcastSchedules } from '@erxes/core-db';
import { eq, sql } from 'drizzle-orm';
import { beforeAll, describe, expect, it } from 'vite-plus/test';
import { runSchedules } from '~/modules/broadcasts/repeating';
import { emailsTo, useBroadcasts } from './broadcasts.fixture';
import { adminDb, useTestDatabase } from './db';
import { settle } from './settle';

const UB = 'Asia/Ulaanbaatar';

/** The time of day an instant is in a zone, `HH:MM`. */
const clockIn = (instant: string | Date, timeZone: string) =>
  new Intl.DateTimeFormat('en-GB', { timeZone, hour: '2-digit', minute: '2-digit' }).format(
    new Date(instant),
  );

/** The day an instant is in a zone, `YYYY-MM-DD`. */
const dayIn = (instant: Date, timeZone: string) =>
  new Intl.DateTimeFormat('en-CA', { timeZone }).format(instant);

/** Makes a schedule's next run come due, `ago` before now (default a minute). */
const makeDue = (broadcastId: string, ago = '1 minute') =>
  adminDb()
    .update(broadcastSchedules)
    .set({ nextRunAt: sql`now() - ${ago}::interval` })
    .where(eq(broadcastSchedules.broadcastId, broadcastId));

/** Mondays, Wednesdays and Fridays at 09:00, from today. */
const weekly = () => ({
  frequency: 'week' as const,
  weekdays: [1, 3, 5],
  at: '09:00',
  startsOn: dayIn(new Date(), UB),
});

/** Recurring broadcasts: each run of the schedule sends a copy of the broadcast. */
describe('recurring broadcasts', { timeout: 300_000 }, () => {
  useTestDatabase();

  const t = useBroadcasts();

  // Every time below is on Ulaanbaatar's clock (UTC+8), not the server's.
  beforeAll(() => t.owner().organizations.update({ timezone: UB }));

  it('makes one run per due time, even when the tick runs twice, and the run sends', async () => {
    const owner = t.owner();

    await t.customersIn('weekly', [{ firstName: 'Bat', primaryEmail: 'bat@weekly.mn' }]);

    const parent = await t.emailTo('weekly', { subject: 'Weekly news' });
    const schedule = await owner.broadcastSchedules.start({ id: parent.id, ...weekly() });

    expect(schedule).toMatchObject({ state: 'active', runs: 0, weekdays: [1, 3, 5] });
    // 09:00 on the organisation's clock: 01:00 UTC in Ulaanbaatar.
    expect(clockIn(schedule.nextRunAt ?? '', UB)).toBe('09:00');
    expect(await owner.broadcasts.get({ id: parent.id })).toMatchObject({
      status: 'recurring',
      nextRunAt: schedule.nextRunAt,
    });
    // A recurring broadcast never sends itself.
    await expect(owner.broadcasts.send({ id: parent.id })).rejects.toMatchObject({
      status: 409,
      code: 'BROADCAST_STATUS',
    });

    await makeDue(parent.id);
    await runSchedules();
    await runSchedules();

    const children = await owner.broadcasts.list({ parentId: parent.id });

    expect(children.data).toHaveLength(1);
    expect(children.data[0]).toMatchObject({ subject: 'Weekly news', parentId: parent.id });

    await settle();

    expect(emailsTo('bat@weekly.mn')).toHaveLength(1);
    expect(await owner.broadcasts.get({ id: children.data[0]?.id ?? '' })).toMatchObject({
      status: 'sent',
      total: 1,
      stats: { sent: 1 },
    });

    const after = await owner.broadcastSchedules.get({ id: parent.id });

    expect(after).toMatchObject({ state: 'active', runs: 1 });
    expect(new Date(after?.nextRunAt ?? 0).getTime()).toBeGreaterThan(Date.now());
  });

  it('after an outage makes one run for the latest missed time', async () => {
    const owner = t.owner();

    await t.customersIn('outage', [{ primaryEmail: 'one@outage.mn' }]);

    const parent = await t.emailTo('outage');

    await owner.broadcastSchedules.start({
      id: parent.id,
      frequency: 'day',
      at: '09:00',
      startsOn: '2026-01-01',
    });
    await makeDue(parent.id, '10 days');
    await runSchedules();

    const children = await owner.broadcasts.list({ parentId: parent.id });

    expect(children.data).toHaveLength(1);

    const occurrence = new Date(children.data[0]?.occurrenceAt ?? 0);

    // The latest 09:00 that had passed: within the last day.
    expect(clockIn(occurrence, UB)).toBe('09:00');
    expect(Date.now() - occurrence.getTime()).toBeLessThan(86_400_000);
  });

  it('pause stops new runs, and the end condition ends it', async () => {
    const owner = t.owner();

    await t.customersIn('ending', [{ primaryEmail: 'one@ending.mn' }]);

    const parent = await t.emailTo('ending');

    await owner.broadcastSchedules.start({ id: parent.id, ...weekly(), maxRuns: 2 });

    expect(await owner.broadcastSchedules.pause({ id: parent.id })).toMatchObject({
      state: 'paused',
      nextRunAt: null,
    });
    await makeDue(parent.id);
    await runSchedules();
    expect((await owner.broadcasts.list({ parentId: parent.id })).data).toHaveLength(0);

    await expect(owner.broadcastSchedules.pause({ id: parent.id })).rejects.toMatchObject({
      status: 409,
      code: 'REPEAT_STATE',
    });
    expect(await owner.broadcastSchedules.resume({ id: parent.id })).toMatchObject({
      state: 'active',
    });

    await makeDue(parent.id);
    await runSchedules();
    await makeDue(parent.id);
    await runSchedules();

    expect(await owner.broadcastSchedules.get({ id: parent.id })).toMatchObject({
      state: 'ended',
      runs: 2,
      nextRunAt: null,
    });

    await makeDue(parent.id);
    await runSchedules();
    expect((await owner.broadcasts.list({ parentId: parent.id })).data).toHaveLength(2);
    await expect(
      owner.broadcastSchedules.save({ id: parent.id, ...weekly() }),
    ).rejects.toMatchObject({ status: 409, code: 'REPEAT_STATE' });
  });

  it('edits reach later runs only, previews and shows upcoming runs, and duplicates as a draft', async () => {
    const owner = t.owner();

    await t.customersIn('edits', [{ primaryEmail: 'one@edits.mn' }]);

    const parent = await t.emailTo('edits', { subject: 'First' });

    await owner.broadcastSchedules.start({ id: parent.id, ...weekly() });
    await makeDue(parent.id);
    await runSchedules();
    await owner.broadcasts.update({ id: parent.id, subject: 'Second' });

    const saved = await owner.broadcastSchedules.save({
      id: parent.id,
      frequency: 'month',
      dayOfMonth: 31,
      at: '18:00',
      startsOn: dayIn(new Date(), UB),
    });

    expect(clockIn(saved.nextRunAt ?? '', UB)).toBe('18:00');

    const [run] = (await owner.broadcasts.list({ parentId: parent.id })).data;

    expect(run?.subject).toBe('First');

    const preview = await owner.broadcastSchedules.preview({
      frequency: 'day',
      at: '07:30',
      startsOn: dayIn(new Date(), UB),
      maxRuns: 3,
    });

    expect(preview.runs).toHaveLength(3);
    expect(preview.runs.map((at) => clockIn(at, UB))).toEqual(['07:30', '07:30', '07:30']);

    const from = new Date();
    const to = new Date(from.getTime() + 62 * 86_400_000);

    const upcoming = await owner.broadcastSchedules.upcoming({
      from: from.toISOString(),
      to: to.toISOString(),
    });

    expect(upcoming.data.filter((row) => row.broadcastId === parent.id).length).toBeGreaterThan(0);

    const copy = await owner.broadcasts.duplicate({ id: parent.id });

    expect(copy).toMatchObject({ status: 'draft', nextRunAt: null });
    expect(await owner.broadcastSchedules.get({ id: copy.id })).toMatchObject({
      state: 'draft',
      frequency: 'month',
      dayOfMonth: 31,
    });
    // Sending the copy once drops its saved rule.
    await owner.broadcasts.schedule({
      id: copy.id,
      at: new Date(Date.now() + 3_600_000).toISOString(),
    });
    expect(await owner.broadcastSchedules.get({ id: copy.id })).toBeNull();
  });

  it('refuses a rule that never runs, and another organisation sees none of it', async () => {
    const owner = t.owner();
    const parent = await t.emailTo('other');

    await expect(
      owner.broadcastSchedules.start({
        id: parent.id,
        frequency: 'day',
        at: '09:00',
        startsOn: '2026-01-01',
        endsOn: '2026-01-02',
      }),
    ).rejects.toMatchObject({ status: 400, code: 'INVALID_INPUT' });
    await expect(
      owner.broadcastSchedules.start({
        id: parent.id,
        frequency: 'week',
        at: '09:00',
        startsOn: '2026-01-01',
      }),
    ).rejects.toMatchObject({ status: 400, code: 'INVALID_INPUT' });

    await owner.broadcastSchedules.start({ id: parent.id, ...weekly() });

    expect(await t.other().broadcastSchedules.get({ id: parent.id })).toBeNull();
    await expect(t.other().broadcastSchedules.stop({ id: parent.id })).rejects.toMatchObject({
      status: 404,
    });
    await expect(
      t.other().broadcastSchedules.start({ id: parent.id, ...weekly() }),
    ).rejects.toMatchObject({ status: 404 });
  });
});
