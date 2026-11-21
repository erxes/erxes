import { automations, emailRamps } from '@erxes/core-db';
import { eq, sql } from 'drizzle-orm';
import { describe, expect, it } from 'vite-plus/test';
import { tickAutomations } from '~/modules/automations/triggers';
import { adminDb, useTestDatabase } from './db';
import { useEmailRamp } from './emailRamp.fixture';
import { settle } from './settle';

/** The time of day an instant is in a zone, `HH:MM`. */
const clockIn = (instant: Date, timeZone: string) =>
  new Intl.DateTimeFormat('en-GB', { timeZone, hour: '2-digit', minute: '2-digit' }).format(
    instant,
  );

/** The day an instant is in a zone, `YYYY-MM-DD`. */
const dayIn = (instant: Date, timeZone: string) =>
  new Intl.DateTimeFormat('en-CA', { timeZone }).format(instant);

const nextRunOf = async (id: string) => {
  const [row] = await adminDb()
    .select({ nextRunAt: automations.nextRunAt })
    .from(automations)
    .where(eq(automations.id, id));

  if (!row?.nextRunAt) throw new Error('the automation has no next run');

  return row.nextRunAt;
};

/** The organisation's time zone: every schedule's clock and day. */
describe('organisation time zone', { timeout: 240_000 }, () => {
  useTestDatabase();

  const t = useEmailRamp();

  it('is UTC until an admin picks a known zone; members and unknown zones are refused', async () => {
    expect(await t.owner().organizations.current({})).toMatchObject({ timezone: 'UTC' });

    await expect(
      t.member().organizations.update({ timezone: 'Asia/Ulaanbaatar' }),
    ).rejects.toMatchObject({ status: 403 });
    await expect(
      t.owner().organizations.update({ timezone: 'Mars/Olympus' }),
    ).rejects.toMatchObject({ code: 'INVALID_INPUT' });
    await expect(t.owner().organizations.update({ timezone: '+08:00' })).rejects.toMatchObject({
      code: 'INVALID_INPUT',
    });

    expect(await t.owner().organizations.update({ timezone: 'Asia/Ulaanbaatar' })).toMatchObject({
      timezone: 'Asia/Ulaanbaatar',
    });

    const audit = await t.owner().audit.list({ action: 'organization.updated' });

    expect(audit.data[0]?.changes).toMatchObject({ timezone: ['UTC', 'Asia/Ulaanbaatar'] });
    // The other organisation keeps its own.
    expect(await t.other().organizations.current({})).toMatchObject({ timezone: 'UTC' });
    // Either IANA name of a zone: Firefox lists Asia/Kolkata, Node Asia/Calcutta.
    expect(await t.owner().organizations.update({ timezone: 'Asia/Kolkata' })).toMatchObject({
      timezone: 'Asia/Kolkata',
    });
  });

  it('fires schedules on the organisation’s clock, and moves them when the zone changes', async () => {
    await t.owner().organizations.update({ timezone: 'Asia/Ulaanbaatar' });

    const { id } = await t.owner().automations.create({
      name: 'Morning note',
      definition: {
        trigger: { kind: 'schedule', every: 'day', at: '09:00' },
        steps: [{ id: 'stop', type: 'stop' }],
      },
    });

    await t.owner().automations.activate({ id });

    const inUlaanbaatar = await nextRunOf(id);

    expect(clockIn(inUlaanbaatar, 'Asia/Ulaanbaatar')).toBe('09:00');
    expect(inUlaanbaatar.getUTCHours()).toBe(1);

    // A new zone: the same wall-clock time on its clock.
    await t.owner().organizations.update({ timezone: 'America/New_York' });

    const inNewYork = await nextRunOf(id);

    expect(clockIn(inNewYork, 'America/New_York')).toBe('09:00');
    expect(inNewYork.getTime()).toBeGreaterThan(Date.now());

    // Due: it fires, and its next time is again 09:00 there.
    await adminDb()
      .update(automations)
      .set({ nextRunAt: sql`now() - interval '1 minute'` })
      .where(eq(automations.id, id));
    expect(await tickAutomations()).toBeGreaterThanOrEqual(1);
    await settle();

    expect(clockIn(await nextRunOf(id), 'America/New_York')).toBe('09:00');
    expect((await t.owner().automations.runs({ id, limit: 10 })).data).toHaveLength(1);
  });

  it('counts the email limit by the organisation’s day, which starts at its midnight', async () => {
    await t.owner().organizations.update({ timezone: 'Asia/Ulaanbaatar' });
    await t.hr().emails.send({ to: ['tz-day@mail.mn'], subject: 'Day', body: 'Hi' });

    const [ramp] = await adminDb()
      .select({ day: emailRamps.day })
      .from(emailRamps)
      .where(eq(emailRamps.orgId, t.ids.org));

    const now = new Date();

    // The day written is Ulaanbaatar's (UTC+8), not UTC's.
    expect(ramp?.day).toBe(dayIn(now, 'Asia/Ulaanbaatar'));

    const limits = await t.owner().emails.limits();
    const opens = new Date(limits.nextWindowAt);

    expect(limits.sentToday).toBe(1);
    // The next allowance opens at Ulaanbaatar's midnight: 16:00 UTC.
    expect(clockIn(opens, 'Asia/Ulaanbaatar')).toBe('00:00');
    expect(opens.getUTCHours()).toBe(16);
    expect(opens.getTime() - now.getTime()).toBeLessThanOrEqual(24 * 60 * 60 * 1000);
    expect(dayIn(opens, 'Asia/Ulaanbaatar') > dayIn(now, 'Asia/Ulaanbaatar')).toBe(true);

    // Yesterday in Ulaanbaatar: a new day, the count starts over.
    await adminDb()
      .update(emailRamps)
      .set({ day: sql`${dayIn(now, 'Asia/Ulaanbaatar')}::date - 1` })
      .where(eq(emailRamps.orgId, t.ids.org));

    expect(await t.owner().emails.limits()).toMatchObject({ sentToday: 0 });
  });

  it('keeps today’s count when the zone changes, so a change never opens a new allowance', async () => {
    // 25 hours apart: their days always differ, and one of them always differs from UTC's.
    const west = 'Pacific/Pago_Pago';
    const east = 'Pacific/Kiritimati';

    const rampDay = async () =>
      (
        await adminDb()
          .select({ day: emailRamps.day })
          .from(emailRamps)
          .where(eq(emailRamps.orgId, t.ids.org))
      )[0]?.day;

    await t.owner().organizations.update({ timezone: west });

    const { sentToday } = await t.owner().emails.limits();

    await t.hr().emails.send({ to: ['tz-carry@mail.mn'], subject: 'Carry', body: 'Hi' });
    expect(await rampDay()).toBe(dayIn(new Date(), west));

    await t.owner().organizations.update({ timezone: east });
    expect(await rampDay()).toBe(dayIn(new Date(), east));
    expect(await t.owner().emails.limits()).toMatchObject({ sentToday: sentToday + 1 });

    await t.owner().organizations.update({ timezone: west });
    expect(await t.owner().emails.limits()).toMatchObject({ sentToday: sentToday + 1 });
  });
});
