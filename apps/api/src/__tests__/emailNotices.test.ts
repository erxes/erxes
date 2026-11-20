import { emailRamps, emailSettings, newId, users } from '@erxes/core-db';
import { eq } from 'drizzle-orm';
import { beforeAll, describe, expect, it } from 'vite-plus/test';
import { seal } from '~/lib/secrets';
import { adminDb, useTestDatabase } from './db';
import { useEmailRamp } from './emailRamp.fixture';
import { settle } from './settle';

const LIMITS = '/settings/integrations/email?tab=limits';

/** What the sending ramp tells the members who manage integrations, and only them. */
describe('email sending notices', { timeout: 240_000 }, () => {
  useTestDatabase();

  const t = useEmailRamp();
  const admin = { id: newId() };

  beforeAll(async () => {
    await adminDb().insert(users).values({
      id: admin.id,
      orgId: t.ids.org,
      email: 'admin@acme.mn',
      role: 'admin',
      status: 'active',
    });
  });

  const noticesOf = async (client: ReturnType<typeof t.owner>, kind: string) =>
    (await client.notifications.list({ kind })).data;

  const asAdmin = () => t.client({ user: admin.id, org: t.ids.org });

  it('tells admins once a day, as it happens, that the day’s limit is reached', async () => {
    await t.resetAcme({ sentToday: 499 });

    await t.hr().emails.send({ to: ['last-1@mail.mn'], subject: 'Last', body: 'Hi' });
    await t.hr().emails.send({ to: ['last-2@mail.mn'], subject: 'Held', body: 'Hi' });
    expect(await t.deliveryTo('last-2@mail.mn')).toMatchObject({ error: 'daily_limit' });
    await settle();

    const expected = [
      {
        title: 'Today’s email limit is reached',
        priority: 'high',
        link: LIMITS,
        data: { limit: 500, timezone: 'UTC' },
      },
    ];

    expect(await noticesOf(t.owner(), 'core.email.limit_reached')).toMatchObject(expected);
    expect(await noticesOf(asAdmin(), 'core.email.limit_reached')).toMatchObject(expected);
    expect(await noticesOf(t.member(), 'core.email.limit_reached')).toEqual([]);
    expect(await noticesOf(t.other(), 'core.email.limit_reached')).toEqual([]);
  });

  it('tells the other admins that a member resumed sending, and why', async () => {
    await t.resetAcme({ tier: 1, haltedAt: new Date(), haltReason: 'Test halt' });

    await t.owner().emails.resumeSending({ reason: 'Cleaned the list' });

    expect(await noticesOf(asAdmin(), 'core.email.resumed')).toMatchObject([
      {
        title: 'Email sending was resumed',
        priority: 'normal',
        actorId: t.ids.owner,
        data: { reason: 'Cleaned the list' },
      },
    ]);
    // Not the one who did it, nor those who can't act on it.
    expect(await noticesOf(t.owner(), 'core.email.resumed')).toEqual([]);
    expect(await noticesOf(t.member(), 'core.email.resumed')).toEqual([]);
  });

  it('tells admins once when their own SendGrid’s events are refused for want of a key', async () => {
    await adminDb()
      .insert(emailSettings)
      .values({
        orgId: t.ids.org,
        provider: 'sendgrid',
        fromEmail: 'news@acme.mn',
        secretSealed: seal('SG.key'),
      });

    const post = () =>
      fetch(t.url(`/core/v1/email/events/sendgrid/${t.ids.org}`), {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: '[]',
      });

    expect((await post()).status).toBe(404);
    expect((await post()).status).toBe(404);
    await t.measured();

    expect(await noticesOf(t.owner(), 'core.email.events_refused')).toMatchObject([
      {
        title: 'Bounces are not being counted',
        priority: 'high',
        link: '/settings/integrations/email',
        data: { provider: 'SendGrid' },
      },
    ]);
    expect(await noticesOf(t.member(), 'core.email.events_refused')).toEqual([]);
    expect(await noticesOf(t.other(), 'core.email.events_refused')).toEqual([]);

    // Back to the server's sending: a key missing later is told anew.
    await t.owner().emails.removeSettings({});

    const [ramp] = await adminDb()
      .select({ eventsNoticeAt: emailRamps.eventsNoticeAt })
      .from(emailRamps)
      .where(eq(emailRamps.orgId, t.ids.org));

    expect(ramp?.eventsNoticeAt).toBeNull();
  });
});
